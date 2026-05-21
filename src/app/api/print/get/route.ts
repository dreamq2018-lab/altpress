import { NextRequest, NextResponse } from 'next/server'
import { fetchPrintJob, incrementPrintCount } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'id 파라미터가 필요합니다.' }, { status: 400 })
  }

  try {
    const job = await fetchPrintJob(id)
    if (!job) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 })
    }
    if (job.expired) {
      return NextResponse.json({ error: 'expired' }, { status: 410 })
    }
    return NextResponse.json({
      articleData: job.articleData,
      layoutType: job.layoutType,
      printCount: job.printCount,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : '알 수 없는 오류'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// 인쇄 카운트 증가용 POST (인쇄 완료 후 호출)
export async function POST(req: NextRequest) {
  let body: { id?: string }
  try {
    body = (await req.json()) as { id?: string }
  } catch {
    return NextResponse.json({ error: '잘못된 요청' }, { status: 400 })
  }
  const id = body.id
  if (!id) {
    return NextResponse.json({ error: 'id 필요' }, { status: 400 })
  }
  try {
    await incrementPrintCount(id)
    return NextResponse.json({ ok: true })
  } catch (e) {
    const msg = e instanceof Error ? e.message : '알 수 없는 오류'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
