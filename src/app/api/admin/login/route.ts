import { NextResponse, type NextRequest } from 'next/server'

const COOKIE_NAME = 'altpress_admin'
const MAX_AGE_SEC = 30 * 24 * 60 * 60 // 30일

export async function POST(req: NextRequest) {
  let body: { password?: string }
  try {
    body = (await req.json()) as { password?: string }
  } catch {
    return NextResponse.json({ error: '잘못된 요청' }, { status: 400 })
  }

  const expected = process.env.ADMIN_PASSWORD
  if (!expected) {
    return NextResponse.json(
      { error: '서버에 ADMIN_PASSWORD가 설정되지 않았습니다.' },
      { status: 500 },
    )
  }

  if (typeof body.password !== 'string' || body.password.length === 0) {
    return NextResponse.json(
      { error: '비밀번호를 입력해주세요.' },
      { status: 400 },
    )
  }

  // 정시간 비교 (단순 비교도 무방하지만 미세한 부분채널 회피)
  if (!safeEqual(body.password, expected)) {
    return NextResponse.json(
      { error: '비밀번호가 일치하지 않습니다.' },
      { status: 401 },
    )
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set({
    name: COOKIE_NAME,
    value: expected,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE_SEC,
  })
  return res
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}
