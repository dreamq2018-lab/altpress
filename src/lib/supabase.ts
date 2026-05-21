import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { ArticleData, ArticleType } from '@/components/layouts'

let cached: SupabaseClient | null = null

function getClient(): SupabaseClient {
  if (cached) return cached
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error(
      'Supabase 키가 설정되지 않았습니다. altpress/.env.local에 NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 입력하세요.',
    )
  }
  cached = createClient(url, key, { auth: { persistSession: false } })
  return cached
}

export type SavedArticle = ArticleData & {
  id: string
  layout: 'thermal' | 'tabloid'
}

interface InsertArticleInput {
  id: string
  type: ArticleType
  layout: 'thermal' | 'tabloid'
  headline: string
  subtitle: string
  body: string
  byline: string
  date: string
  location: string
  authorName: string
  mediaName: string
  mediaNameHanja?: string
  issueNumber?: string
}

export async function insertArticle(input: InsertArticleInput) {
  const { error } = await getClient().from('altpress_articles').insert({
    id: input.id,
    type: input.type,
    layout: input.layout,
    headline: input.headline,
    subtitle: input.subtitle,
    body: input.body,
    byline: input.byline,
    date: input.date,
    location: input.location,
    author_name: input.authorName,
    media_name: input.mediaName,
    media_name_hanja: input.mediaNameHanja ?? null,
    issue_number: input.issueNumber ?? null,
  })
  if (error) throw new Error(`Supabase insert 실패: ${error.message}`)
}

export async function fetchArticle(id: string): Promise<SavedArticle | null> {
  const { data, error } = await getClient()
    .from('altpress_articles')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw new Error(`Supabase select 실패: ${error.message}`)
  if (!data) return null

  return {
    id: data.id as string,
    type: data.type as ArticleType,
    layout: data.layout as 'thermal' | 'tabloid',
    headline: data.headline as string,
    subtitle: data.subtitle as string,
    body: data.body as string,
    byline: data.byline as string,
    date: data.date as string,
    location: data.location as string,
    authorName: data.author_name as string,
    mediaName: data.media_name as string,
    mediaNameHanja: (data.media_name_hanja as string | null) ?? undefined,
    issueNumber: (data.issue_number as string | null) ?? undefined,
    photos: [],
  }
}

// ────────────────────────────────────────────────────────────
// Print jobs — 24시간 만료 임시 인쇄 대기열
// ────────────────────────────────────────────────────────────

export type PrintLayoutType = 'thermal' | 'tabloid'

export interface InsertPrintJobInput {
  id: string
  articleData: ArticleData
  layoutType: PrintLayoutType
}

export async function insertPrintJob(input: InsertPrintJobInput) {
  // 사진은 base64라 용량이 크고 인쇄에 큰 가치가 없어 제외
  const { photos, ...rest } = input.articleData
  void photos
  const slim = { ...rest, photos: [] }

  const { error } = await getClient().from('print_jobs').insert({
    id: input.id,
    article_data: slim,
    layout_type: input.layoutType,
  })
  if (error) throw new Error(`Supabase print_jobs insert 실패: ${error.message}`)
}

export interface FetchPrintJobResult {
  articleData: ArticleData
  layoutType: PrintLayoutType
  expired: boolean
  printCount: number
}

export async function fetchPrintJob(
  id: string,
): Promise<FetchPrintJobResult | null> {
  const { data, error } = await getClient()
    .from('print_jobs')
    .select('article_data, layout_type, expires_at, print_count')
    .eq('id', id)
    .maybeSingle()

  if (error) throw new Error(`Supabase print_jobs select 실패: ${error.message}`)
  if (!data) return null

  const expiresAt = new Date(data.expires_at as string)
  const expired = expiresAt.getTime() < Date.now()

  return {
    articleData: data.article_data as ArticleData,
    layoutType: data.layout_type as PrintLayoutType,
    expired,
    printCount: (data.print_count as number) ?? 0,
  }
}

export interface PrintJobRow {
  id: string
  articleData: ArticleData
  layoutType: PrintLayoutType
  createdAt: string
  expiresAt: string
  printed: boolean
  printCount: number
}

export async function listPrintJobs(limit = 100): Promise<PrintJobRow[]> {
  const { data, error } = await getClient()
    .from('print_jobs')
    .select('id, article_data, layout_type, created_at, expires_at, printed, print_count')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw new Error(`print_jobs list 실패: ${error.message}`)
  return (data ?? []).map((row) => ({
    id: row.id as string,
    articleData: row.article_data as ArticleData,
    layoutType: row.layout_type as PrintLayoutType,
    createdAt: row.created_at as string,
    expiresAt: row.expires_at as string,
    printed: row.printed as boolean,
    printCount: (row.print_count as number) ?? 0,
  }))
}

export async function getPrintJobStats(): Promise<{ today: number; total: number }> {
  const client = getClient()
  // 전체 개수
  const { count: total, error: errTotal } = await client
    .from('print_jobs')
    .select('id', { count: 'exact', head: true })
  if (errTotal) throw new Error(`print_jobs total 실패: ${errTotal.message}`)
  // 오늘 개수 (서버 시각 기준 자정 이후)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const { count: todayCount, error: errToday } = await client
    .from('print_jobs')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', today.toISOString())
  if (errToday) throw new Error(`print_jobs today 실패: ${errToday.message}`)
  return { today: todayCount ?? 0, total: total ?? 0 }
}

export async function incrementPrintCount(id: string) {
  const client = getClient()
  // 원자적 증가를 위해 RPC를 만드는 게 이상적이지만, 간단히 select+update
  const { data, error: selErr } = await client
    .from('print_jobs')
    .select('print_count')
    .eq('id', id)
    .maybeSingle()
  if (selErr || !data) return
  const next = ((data.print_count as number) ?? 0) + 1
  await client
    .from('print_jobs')
    .update({ print_count: next, printed: true })
    .eq('id', id)
}
