import { NextResponse, type NextRequest } from 'next/server'

const COOKIE_NAME = 'altpress_admin'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // /admin/* 외엔 통과
  if (!pathname.startsWith('/admin')) return NextResponse.next()
  // 로그인 페이지·로그인 API는 인증 검사 면제
  if (pathname === '/admin/login' || pathname.startsWith('/admin/login/')) {
    return NextResponse.next()
  }

  const expected = process.env.ADMIN_PASSWORD
  if (!expected) {
    // env가 설정 안 되면 안전하게 차단
    return NextResponse.redirect(
      new URL('/admin/login?error=server_misconfigured', req.url),
    )
  }

  const cookieValue = req.cookies.get(COOKIE_NAME)?.value
  if (cookieValue !== expected) {
    const loginUrl = new URL('/admin/login', req.url)
    if (pathname !== '/admin') {
      loginUrl.searchParams.set('next', pathname)
    }
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
