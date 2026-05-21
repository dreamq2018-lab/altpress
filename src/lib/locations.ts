// altpress가 다루는 관광지 목록 (광고·QR·관리자 페이지에서 공유)

export const LOCATIONS: ReadonlyArray<string> = [
  '강진 다산초당',
  '강진 청자박물관',
  '강진 가우도',
  '보성 녹차밭',
  '고흥 나로우주센터',
  '장흥 정남진',
  '장흥 천관산',
] as const

// 광고 locations 배열에 이 토큰이 포함되면 모든 지역에서 표시됨
export const ALL_LOCATIONS_TOKEN = '전체'

export const ADMIN_KEY = 'altpress2026'

export function adminUrl(path: string, params: Record<string, string> = {}): string {
  const search = new URLSearchParams({ key: ADMIN_KEY, ...params })
  return `${path}?${search.toString()}`
}
