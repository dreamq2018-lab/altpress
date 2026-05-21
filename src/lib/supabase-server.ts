import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

// 서버 컴포넌트·라우트 핸들러용 Supabase 클라이언트.
// 쿠키를 통해 세션을 자동으로 동기화함.
export function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error(
      'Supabase 키가 설정되지 않았습니다. .env.local 확인.',
    )
  }
  const cookieStore = cookies()
  return createServerClient(url, key, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch {
          // 서버 컴포넌트에서는 set이 throw — middleware/route handler에서만 호출 가능
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options })
        } catch {
          // 위와 동일
        }
      },
    },
  })
}
