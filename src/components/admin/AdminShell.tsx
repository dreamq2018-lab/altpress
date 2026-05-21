'use client'

import Link from 'next/link'
import type { CSSProperties, ReactNode } from 'react'
import { adminUrl } from '@/lib/locations'

interface AdminShellProps {
  title: string
  breadcrumb?: ReactNode
  children: ReactNode
}

const NAVY = '#1B3A6B'

const pageStyle: CSSProperties = {
  minHeight: '100vh',
  background: '#f5f5f5',
  fontFamily: "'Nanum Gothic', sans-serif",
  paddingBottom: 60,
}

const headerStyle: CSSProperties = {
  background: NAVY,
  color: '#fff',
  padding: '16px 24px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 12,
  flexWrap: 'wrap',
}

const brandStyle: CSSProperties = {
  fontFamily: "'Nanum Myeongjo', serif",
  fontSize: 18,
  fontWeight: 800,
  letterSpacing: 1,
}

const navStyle: CSSProperties = {
  display: 'flex',
  gap: 16,
  fontSize: 14,
}

const navLinkStyle: CSSProperties = {
  color: '#fff',
  textDecoration: 'none',
  opacity: 0.8,
}

const titleBarStyle: CSSProperties = {
  background: '#fff',
  borderBottom: '1px solid #e5e5e5',
  padding: '20px 24px',
}

const titleStyle: CSSProperties = {
  fontSize: 22,
  fontWeight: 800,
  color: NAVY,
}

const breadcrumbStyle: CSSProperties = {
  fontSize: 12,
  color: '#888',
  marginTop: 4,
}

const contentStyle: CSSProperties = {
  maxWidth: 1100,
  margin: '24px auto',
  padding: '0 24px',
}

export default function AdminShell({
  title,
  breadcrumb,
  children,
}: AdminShellProps) {
  return (
    <main style={pageStyle}>
      <header style={headerStyle}>
        <div style={brandStyle}>ALT프로덕션 관리자</div>
        <nav style={navStyle}>
          <Link href={adminUrl('/admin')} style={navLinkStyle}>
            대시보드
          </Link>
          <Link href={adminUrl('/admin/ads')} style={navLinkStyle}>
            광고 관리
          </Link>
          <Link href={adminUrl('/admin/jobs')} style={navLinkStyle}>
            인쇄 현황
          </Link>
        </nav>
      </header>
      <div style={titleBarStyle}>
        <div style={titleStyle}>{title}</div>
        {breadcrumb && <div style={breadcrumbStyle}>{breadcrumb}</div>}
      </div>
      <div style={contentStyle}>{children}</div>
    </main>
  )
}
