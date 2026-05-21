import { NextResponse, type NextRequest } from 'next/server'

const ADMIN_KEY = 'altpress2026'
const COOKIE_NAME = 'altpress_admin'

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl

  if (!pathname.startsWith('/admin')) return NextResponse.next()

  // 쿼리에 key가 있으면 통과 + 쿠키 발급 (세션 유지용)
  const key = searchParams.get('key')
  if (key === ADMIN_KEY) {
    const res = NextResponse.next()
    res.cookies.set(COOKIE_NAME, ADMIN_KEY, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8, // 8시간
    })
    return res
  }

  // 쿠키가 있어도 통과
  const cookieKey = req.cookies.get(COOKIE_NAME)?.value
  if (cookieKey === ADMIN_KEY) return NextResponse.next()

  // 둘 다 없으면 홈으로
  return NextResponse.redirect(new URL('/', req.url))
}

export const config = {
  matcher: ['/admin/:path*'],
}
