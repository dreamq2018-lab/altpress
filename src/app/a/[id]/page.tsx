import { notFound } from 'next/navigation'
import type { CSSProperties } from 'react'
import { fetchArticle } from '@/lib/supabase'
import { TabloidLayout, ThermalLayout } from '@/components/layouts'
import PrintButton from './PrintButton'

interface PageProps {
  params: { id: string }
}

const NAVY = '#1B3A6B'

const pageStyle: CSSProperties = {
  minHeight: '100vh',
  background: '#f5f5f5',
  paddingBottom: 60,
  fontFamily: "'Nanum Gothic', sans-serif",
}

const toolbarStyle: CSSProperties = {
  background: NAVY,
  color: '#fff',
  padding: '14px 16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  flexWrap: 'wrap',
}

const toolbarTitleStyle: CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
}

const metaStyle: CSSProperties = {
  fontSize: 12,
  opacity: 0.85,
}

const previewWrapStyle: CSSProperties = {
  maxWidth: 1100,
  margin: '24px auto 0',
  padding: '0 16px',
}

const printAreaWrapStyle: CSSProperties = {
  background: '#fff',
  padding: 24,
  display: 'flex',
  justifyContent: 'center',
  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  borderRadius: 8,
}

export default async function ArticleViewPage({ params }: PageProps) {
  const article = await fetchArticle(params.id).catch(() => null)
  if (!article) notFound()

  const isTabloid = article.layout === 'tabloid'
  const qrUrl =
    typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SITE_URL
      ? `${process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')}/a/${article.id}`
      : `/a/${article.id}`

  return (
    <main style={pageStyle}>
      <header className="no-print" style={toolbarStyle}>
        <div>
          <div style={toolbarTitleStyle}>📰 기사 #{article.id}</div>
          <div style={metaStyle}>
            {article.location} · {article.authorName} · {article.date}
          </div>
        </div>
        <PrintButton />
      </header>

      <div style={previewWrapStyle}>
        <div id="print-area" style={printAreaWrapStyle}>
          {isTabloid ? (
            <div
              style={{
                transform: 'scale(0.65)',
                transformOrigin: 'top center',
                width: '279mm',
              }}
            >
              <TabloidLayout article={article} />
            </div>
          ) : (
            <ThermalLayout article={article} qrUrl={qrUrl} />
          )}
        </div>
      </div>
    </main>
  )
}

export const dynamic = 'force-dynamic'
