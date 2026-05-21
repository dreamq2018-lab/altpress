import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { ALL_LOCATIONS_TOKEN } from './locations'

export interface AdData {
  id: string
  advertiser: string
  message: string
  sub_message?: string
  locations: string[]
  active: boolean
  starts_at?: string
  ends_at?: string
  created_at?: string
}

let cached: SupabaseClient | null = null

function getClient(): SupabaseClient {
  if (cached) return cached
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error(
      'Supabase 키가 설정되지 않았습니다. .env.local 확인.',
    )
  }
  cached = createClient(url, key, { auth: { persistSession: false } })
  return cached
}

function rowToAd(row: Record<string, unknown>): AdData {
  return {
    id: row.id as string,
    advertiser: row.advertiser as string,
    message: row.message as string,
    sub_message: (row.sub_message as string | null) ?? undefined,
    locations: (row.locations as string[]) ?? [],
    active: row.active as boolean,
    starts_at: (row.starts_at as string | null) ?? undefined,
    ends_at: (row.ends_at as string | null) ?? undefined,
    created_at: (row.created_at as string | null) ?? undefined,
  }
}

function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * 주어진 location에 표시할 수 있는 광고 중 1개를 랜덤하게 반환.
 * 조건: active=true · locations 배열에 location 또는 "전체" 포함 · 게재 기간 내.
 * 없으면 null.
 */
export async function getAdByLocation(
  location: string,
): Promise<AdData | null> {
  const today = todayISO()
  // Supabase 배열 contains 연산 — overlaps(locations, '{...}')는 어느 하나라도 포함하면 true
  const { data, error } = await getClient()
    .from('altpress_ads')
    .select('*')
    .eq('active', true)
    .overlaps('locations', [location, ALL_LOCATIONS_TOKEN])
    .or(`starts_at.is.null,starts_at.lte.${today}`)
    .or(`ends_at.is.null,ends_at.gte.${today}`)

  if (error) {
    console.error('getAdByLocation error:', error.message)
    return null
  }
  if (!data || data.length === 0) return null

  const pick = data[Math.floor(Math.random() * data.length)]
  return rowToAd(pick as Record<string, unknown>)
}

export async function listAds(): Promise<AdData[]> {
  const { data, error } = await getClient()
    .from('altpress_ads')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(`ads list 실패: ${error.message}`)
  return (data ?? []).map((row) => rowToAd(row as Record<string, unknown>))
}

export async function getAd(id: string): Promise<AdData | null> {
  const { data, error } = await getClient()
    .from('altpress_ads')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw new Error(`ads get 실패: ${error.message}`)
  if (!data) return null
  return rowToAd(data as Record<string, unknown>)
}

export interface AdInput {
  advertiser: string
  message: string
  sub_message?: string
  locations: string[]
  starts_at?: string
  ends_at?: string
  active?: boolean
}

export async function insertAd(input: AdInput): Promise<AdData> {
  const { data, error } = await getClient()
    .from('altpress_ads')
    .insert({
      advertiser: input.advertiser,
      message: input.message,
      sub_message: input.sub_message ?? null,
      locations: input.locations,
      starts_at: input.starts_at ?? null,
      ends_at: input.ends_at ?? null,
      active: input.active ?? true,
    })
    .select()
    .single()
  if (error) throw new Error(`ads insert 실패: ${error.message}`)
  return rowToAd(data as Record<string, unknown>)
}

export async function updateAd(id: string, input: Partial<AdInput>): Promise<void> {
  const patch: Record<string, unknown> = {}
  if (input.advertiser !== undefined) patch.advertiser = input.advertiser
  if (input.message !== undefined) patch.message = input.message
  if (input.sub_message !== undefined) patch.sub_message = input.sub_message ?? null
  if (input.locations !== undefined) patch.locations = input.locations
  if (input.starts_at !== undefined) patch.starts_at = input.starts_at ?? null
  if (input.ends_at !== undefined) patch.ends_at = input.ends_at ?? null
  if (input.active !== undefined) patch.active = input.active

  const { error } = await getClient().from('altpress_ads').update(patch).eq('id', id)
  if (error) throw new Error(`ads update 실패: ${error.message}`)
}

export async function toggleAdActive(id: string, active: boolean): Promise<void> {
  await updateAd(id, { active })
}

export async function deleteAd(id: string): Promise<void> {
  const { error } = await getClient().from('altpress_ads').delete().eq('id', id)
  if (error) throw new Error(`ads delete 실패: ${error.message}`)
}
