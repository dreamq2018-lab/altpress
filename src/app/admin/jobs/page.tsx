'use client'

import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import AdminShell from '@/components/admin/AdminShell'
import {
  type PrintJobRow,
  getPrintJobStats,
  listPrintJobs,
} from '@/lib/supabase'

const NAVY = '#1B3A6B'

const statRowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 12,
  marginBottom: 24,
}

const statCardStyle: CSSProperties = {
  background: '#fff',
  borderRadius: 10,
  padding: '18px 20px',
  border: '1.5px solid #e5e5e5',
}

const statLabelStyle: CSSProperties = {
  fontSize: 12,
  color: '#888',
  fontWeight: 700,
  letterSpacing: 1,
  marginBottom: 6,
}

const statValueStyle: CSSProperties = {
  fontSize: 28,
  fontWeight: 800,
  color: NAVY,
}

const tableWrapStyle: CSSProperties = {
  background: '#fff',
  borderRadius: 10,
  overflow: 'auto',
  border: '1px solid #e5e5e5',
}

const tableStyle: CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 14,
}

const thStyle: CSSProperties = {
  background: '#f7f7f7',
  textAlign: 'left',
  padding: '12px 14px',
  fontSize: 12,
  fontWeight: 700,
  color: '#555',
  borderBottom: '1px solid #e5e5e5',
  whiteSpace: 'nowrap',
}

const tdStyle: CSSProperties = {
  padding: '12px 14px',
  borderBottom: '1px solid #f0f0f0',
  color: '#222',
}

const badgeStyle = (printed: boolean): CSSProperties => ({
  display: 'inline-block',
  padding: '3px 10px',
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 700,
  background: printed ? '#e6f4ea' : '#fef3e2',
  color: printed ? '#0a8043' : '#a66100',
})

const emptyStyle: CSSProperties = {
  padding: '60px 20px',
  textAlign: 'center',
  color: '#888',
  fontSize: 14,
}

// 헤드라인이 아니라 byline의 글자로 언어 감지 (article_data.byline)
function detectLanguage(text: string): string {
  if (/[぀-ゟ゠-ヿ]/.test(text)) return '日本語'
  if (/[가-힯]/.test(text)) return '한국어'
  if (/[一-鿿]/.test(text)) return '中文'
  if (/[A-Za-z]/.test(text)) return 'English'
  return '기타'
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  const date = `${d.getMonth() + 1}/${d.getDate()}`
  return `${date} ${h}:${m}`
}

export default function JobsPage() {
  const [stats, setStats] = useState<{ today: number; total: number } | null>(
    null,
  )
  const [jobs, setJobs] = useState<PrintJobRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([getPrintJobStats(), listPrintJobs(50)])
      .then(([s, j]) => {
        if (cancelled) return
        setStats(s)
        setJobs(j)
      })
      .catch((e) => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : '조회 실패')
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <AdminShell title="인쇄 현황" breadcrumb="대시보드 / 인쇄 현황">
      {error && (
        <div
          style={{
            background: '#fff4f4',
            border: '1px solid #d33',
            padding: '12px 16px',
            borderRadius: 6,
            color: '#a00',
            marginBottom: 16,
            fontSize: 13,
          }}
        >
          ⚠ {error}
        </div>
      )}

      <div style={statRowStyle}>
        <div style={statCardStyle}>
          <div style={statLabelStyle}>오늘 인쇄</div>
          <div style={statValueStyle}>{stats ? `${stats.today}건` : '…'}</div>
        </div>
        <div style={statCardStyle}>
          <div style={statLabelStyle}>전체 인쇄</div>
          <div style={statValueStyle}>{stats ? `${stats.total}건` : '…'}</div>
        </div>
      </div>

      <div style={tableWrapStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>시간</th>
              <th style={thStyle}>언어</th>
              <th style={thStyle}>장소</th>
              <th style={thStyle}>작성자</th>
              <th style={thStyle}>레이아웃</th>
              <th style={thStyle}>인쇄 횟수</th>
              <th style={thStyle}>상태</th>
            </tr>
          </thead>
          <tbody>
            {jobs === null ? (
              <tr>
                <td colSpan={7} style={emptyStyle}>
                  불러오는 중…
                </td>
              </tr>
            ) : jobs.length === 0 ? (
              <tr>
                <td colSpan={7} style={emptyStyle}>
                  인쇄 기록이 없습니다.
                </td>
              </tr>
            ) : (
              jobs.map((j) => {
                const lang = detectLanguage(j.articleData.byline ?? '')
                return (
                  <tr key={j.id}>
                    <td style={{ ...tdStyle, whiteSpace: 'nowrap', fontSize: 13 }}>
                      {formatTime(j.createdAt)}
                    </td>
                    <td style={tdStyle}>{lang}</td>
                    <td style={tdStyle}>{j.articleData.location}</td>
                    <td style={tdStyle}>{j.articleData.authorName}</td>
                    <td style={tdStyle}>
                      {j.layoutType === 'thermal' ? '감열 (80mm)' : '타블로이드'}
                    </td>
                    <td style={tdStyle}>{j.printCount}회</td>
                    <td style={tdStyle}>
                      <span style={badgeStyle(j.printed)}>
                        {j.printed ? '인쇄됨' : '대기'}
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  )
}
