'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import AdminShell from '@/components/admin/AdminShell'
import { listAds } from '@/lib/ads'
import { adminUrl } from '@/lib/locations'
import { getPrintJobStats } from '@/lib/supabase'

const NAVY = '#1B3A6B'

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
  gap: 16,
}

const cardStyle: CSSProperties = {
  background: '#fff',
  borderRadius: 12,
  padding: '24px',
  border: '1.5px solid #ddd',
  textDecoration: 'none',
  color: '#222',
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
}

const cardTitleStyle: CSSProperties = {
  fontSize: 18,
  fontWeight: 800,
  color: NAVY,
}

const statRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: 14,
  color: '#444',
  paddingTop: 12,
  borderTop: '1px solid #eee',
}

const statValStyle: CSSProperties = {
  fontWeight: 700,
  color: NAVY,
}

export default function AdminDashboardPage() {
  const [adsTotal, setAdsTotal] = useState<number | null>(null)
  const [adsActive, setAdsActive] = useState<number | null>(null)
  const [jobsToday, setJobsToday] = useState<number | null>(null)
  const [jobsTotal, setJobsTotal] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    listAds()
      .then((ads) => {
        if (cancelled) return
        setAdsTotal(ads.length)
        setAdsActive(ads.filter((a) => a.active).length)
      })
      .catch((e) => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : '광고 조회 실패')
      })

    getPrintJobStats()
      .then((stats) => {
        if (cancelled) return
        setJobsToday(stats.today)
        setJobsTotal(stats.total)
      })
      .catch((e) => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : '인쇄 통계 조회 실패')
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <AdminShell title="대시보드">
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
      <div style={gridStyle}>
        <Link href={adminUrl('/admin/ads')} style={cardStyle}>
          <div style={cardTitleStyle}>📢 광고 관리</div>
          <div style={{ fontSize: 13, color: '#666' }}>
            관광지별 광고 등록·수정·ON/OFF
          </div>
          <div style={statRowStyle}>
            <span>현재 광고</span>
            <span style={statValStyle}>{adsTotal ?? '…'}개</span>
          </div>
          <div style={statRowStyle}>
            <span>활성 광고</span>
            <span style={statValStyle}>{adsActive ?? '…'}개</span>
          </div>
        </Link>

        <Link href={adminUrl('/admin/jobs')} style={cardStyle}>
          <div style={cardTitleStyle}>🖨 인쇄 현황</div>
          <div style={{ fontSize: 13, color: '#666' }}>
            최근 인쇄 요청 내역과 통계
          </div>
          <div style={statRowStyle}>
            <span>오늘 인쇄</span>
            <span style={statValStyle}>{jobsToday ?? '…'}건</span>
          </div>
          <div style={statRowStyle}>
            <span>전체 인쇄</span>
            <span style={statValStyle}>{jobsTotal ?? '…'}건</span>
          </div>
        </Link>
      </div>
    </AdminShell>
  )
}
