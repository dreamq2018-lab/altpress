import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

// 매직 링크 클릭 시 Supabase가 ?code=... 로 리다이렉트.
// 여기서 code를 세션으로 교환하고 쿠키를 발급한 뒤 next 경로로 이동.
export async function GET(req: NextRequest) {
  const { searchParams, origin } = req.nextUrl
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/admin'

  if (!code) {
    return NextResponse.redirect(
      `${origin}/admin/login?error=missing_code`,
    )
  }

  const supabase = createSupabaseServerClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(
      `${origin}/admin/login?error=${encodeURIComponent(error.message)}`,
    )
  }

  return NextResponse.redirect(`${origin}${next}`)
}
