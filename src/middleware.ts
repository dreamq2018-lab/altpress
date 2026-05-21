import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isAdminEmail } from '@/lib/auth'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // /admin/* 외엔 모두 통과
  if (!pathname.startsWith('/admin')) return NextResponse.next()
  // 로그인 페이지 자체는 인증 검사 면제
  if (pathname === '/admin/login' || pathname.startsWith('/admin/login/')) {
    return NextResponse.next()
  }

  const res = NextResponse.next({ request: { headers: req.headers } })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    // Supabase가 설정 안 되어 있으면 로그인 페이지로 보냄
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      get(name: string) {
        return req.cookies.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        res.cookies.set({ name, value, ...options })
      },
      remove(name: string, options: CookieOptions) {
        res.cookies.set({ name, value: '', ...options })
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !isAdminEmail(user.email)) {
    const loginUrl = new URL('/admin/login', req.url)
    if (pathname !== '/admin') {
      loginUrl.searchParams.set('next', pathname)
    }
    return NextResponse.redirect(loginUrl)
  }

  return res
}

export const config = {
  matcher: ['/admin/:path*'],
}
