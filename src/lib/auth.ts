// 관리자로 허용된 이메일 목록.
// 추가/제거는 이 배열을 수정 후 재배포하세요.
export const ADMIN_EMAILS: ReadonlyArray<string> = [
  'kimbomi891204@gmail.com',
] as const

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(email.toLowerCase())
}
