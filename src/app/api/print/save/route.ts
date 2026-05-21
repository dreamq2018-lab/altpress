import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import type { ArticleData } from '@/components/layouts'
import { insertPrintJob, type PrintLayoutType } from '@/lib/supabase'

export interface SavePrintJobRequest {
  articleData: ArticleData
  layoutType: PrintLayoutType
}

export interface SavePrintJobResponse {
  id: string
  printUrl: string
}

export async function POST(req: NextRequest) {
  let body: SavePrintJobRequest
  try {
    body = (await req.json()) as SavePrintJobRequest
  } catch {
    return NextResponse.json(
      { error: '잘못된 JSON 요청 본문입니다.' },
      { status: 400 },
    )
  }

  if (!body.articleData || !body.layoutType) {
    return NextResponse.json(
      { error: 'articleData와 layoutType은 필수입니다.' },
      { status: 400 },
    )
  }

  const id = uuidv4()

  try {
    await insertPrintJob({
      id,
      articleData: body.articleData,
      layoutType: body.layoutType,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : '알 수 없는 오류'
    return NextResponse.json(
      { error: `인쇄 대기열 저장 실패: ${msg}` },
      { status: 500 },
    )
  }

  // 절대 URL — NEXT_PUBLIC_SITE_URL이 있으면 우선, 아니면 요청 origin fallback
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
  const origin = siteUrl ?? req.nextUrl.origin
  const printUrl = `${origin}/print/${id}`

  return NextResponse.json({ id, printUrl } satisfies SavePrintJobResponse)
}
