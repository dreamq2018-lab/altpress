import type { ArticleType } from './types'

const WEEKDAYS = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']

export function formatDate(date: string): string {
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return date
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${WEEKDAYS[d.getDay()]}`
}

const TYPE_LABELS: Record<ArticleType, string> = {
  travel: '현지 취재',
  reporter: '마을 리포터',
  editor: '기획 기사',
}

export function getTypeLabel(type: string): string {
  return TYPE_LABELS[type as ArticleType] ?? ''
}

export const PRINT_IMAGE_FILTER = 'grayscale(100%) contrast(1.4) brightness(1.1)'

export function processImageForPrint(): string {
  return PRINT_IMAGE_FILTER
}

export const FONT_MYEONGJO = "'Nanum Myeongjo', serif"
export const FONT_GOTHIC = "'Nanum Gothic', sans-serif"
