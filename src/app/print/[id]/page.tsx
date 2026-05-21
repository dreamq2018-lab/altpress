'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import type { CSSProperties } from 'react'
import {
  type ArticleData,
  TabloidLayout,
  ThermalLayout,
} from '@/components/layouts'
import { type AdData, getAdByLocation } from '@/lib/ads'

type LayoutType = 'thermal' | 'tabloid'
type ViewState = 'loading' | 'ready' | 'expired' | 'not_found' | 'error'

interface FetchedJob {
  articleData: ArticleData
  layoutType: LayoutType
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
  padding: '16px 16px 18px',
  textAlign: 'center',
}

const toolbarTitleStyle: CSSProperties = {
  fontSize: 15,
  fontWeight: 700,
  marginBottom: 8,
  letterSpacing: '-0.3px',
}

const toolbarMetaStyle: CSSProperties = {
  fontSize: 12,
  opacity: 0.85,
  marginBottom: 12,
}

const printButtonStyle: CSSProperties = {
  background: '#fff',
  color: NAVY,
  border: '2px solid #fff',
  borderRadius: 8,
  padding: '14px 28px',
  fontSize: 18,
  fontWeight: 800,
  cursor: 'pointer',
  fontFamily: 'inherit',
  minHeight: 56,
  minWidth: 200,
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

const centerCardStyle: CSSProperties = {
  maxWidth: 460,
  margin: '60px auto',
  padding: '40px 28px',
  background: '#fff',
  borderRadius: 12,
  textAlign: 'center',
  border: '2px solid #ddd',
  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
}

const stateIconStyle: CSSProperties = {
  fontSize: 48,
  lineHeight: 1,
  marginBottom: 12,
}

const stateTitleStyle: CSSProperties = {
  fontSize: 20,
  fontWeight: 800,
  color: NAVY,
  marginBottom: 8,
}

const stateMsgStyle: CSSProperties = {
  fontSize: 14,
  color: '#555',
  lineHeight: 1.6,
  marginBottom: 24,
}

const linkBtnStyle: CSSProperties = {
  display: 'inline-block',
  padding: '12px 22px',
  background: NAVY,
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  fontSize: 14,
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'inherit',
}

export default function PrintPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params.id

  const [state, setState] = useState<ViewState>('loading')
  const [job, setJob] = useState<FetchedJob | null>(null)
  const [adData, setAdData] = useState<AdData | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/print/get?id=${encodeURIComponent(id)}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}))
        if (cancelled) return
        if (res.ok) {
          setJob({
            articleData: data.articleData,
            layoutType: data.layoutType,
          })
          // 광고 조회 — 실패해도 인쇄 흐름은 진행
          getAdByLocation(data.articleData.location)
            .then((ad) => {
              if (!cancelled) setAdData(ad)
            })
            .catch(() => {})
          setState('ready')
        } else if (res.status === 410) {
          setState('expired')
        } else if (res.status === 404) {
          setState('not_found')
        } else {
          setErrorMsg(data.error ?? `HTTP ${res.status}`)
          setState('error')
        }
      })
      .catch((e: unknown) => {
        if (cancelled) return
        const msg = e instanceof Error ? e.message : '알 수 없는 오류'
        setErrorMsg(msg)
        setState('error')
      })
    return () => {
      cancelled = true
    }
  }, [id])

  const triggerPrint = useCallback(() => {
    // 인쇄 카운트 +1 (fire-and-forget)
    fetch('/api/print/get', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    }).catch(() => {})
    window.print()
  }, [id])

  // 자동 인쇄: 페이지 ready 후 3초 뒤
  useEffect(() => {
    if (state !== 'ready') return
    const timer = setTimeout(() => {
      triggerPrint()
    }, 3000)
    return () => clearTimeout(timer)
  }, [state, triggerPrint])

  if (state === 'loading') {
    return (
      <main style={pageStyle}>
        <div style={centerCardStyle}>
          <div style={stateIconStyle}>📰</div>
          <div style={stateTitleStyle}>신문을 불러오고 있습니다…</div>
          <div style={stateMsgStyle}>잠시만 기다려 주세요.</div>
        </div>
      </main>
    )
  }

  if (state === 'expired') {
    return (
      <main style={pageStyle}>
        <div style={centerCardStyle}>
          <div style={stateIconStyle}>⏱</div>
          <div style={stateTitleStyle}>이 신문은 만료되었습니다</div>
          <div style={stateMsgStyle}>
            생성된 지 24시간이 지났습니다.
            <br />새 신문을 만들어 주세요.
          </div>
          <button
            type="button"
            style={linkBtnStyle}
            onClick={() => router.push('/')}
          >
            새 신문 만들기
          </button>
        </div>
      </main>
    )
  }

  if (state === 'not_found') {
    return (
      <main style={pageStyle}>
        <div style={centerCardStyle}>
          <div style={stateIconStyle}>🔍</div>
          <div style={stateTitleStyle}>신문을 찾을 수 없습니다</div>
          <div style={stateMsgStyle}>
            QR 주소가 잘못되었거나 이미 삭제된 신문입니다.
          </div>
          <button
            type="button"
            style={linkBtnStyle}
            onClick={() => router.push('/')}
          >
            새 신문 만들기
          </button>
        </div>
      </main>
    )
  }

  if (state === 'error' || !job) {
    return (
      <main style={pageStyle}>
        <div style={centerCardStyle}>
          <div style={stateIconStyle}>⚠</div>
          <div style={stateTitleStyle}>오류가 발생했습니다</div>
          <div style={stateMsgStyle}>{errorMsg ?? '알 수 없는 오류'}</div>
          <button
            type="button"
            style={linkBtnStyle}
            onClick={() => router.push('/')}
          >
            처음으로
          </button>
        </div>
      </main>
    )
  }

  const isTabloid = job.layoutType === 'tabloid'

  return (
    <main style={pageStyle}>
      <header className="no-print" style={toolbarStyle}>
        <div style={toolbarTitleStyle}>인쇄 버튼을 눌러주세요</div>
        <div style={toolbarMetaStyle}>
          3초 후 자동으로 인쇄 창이 열립니다.
        </div>
        <button type="button" style={printButtonStyle} onClick={triggerPrint}>
          🖨 인쇄하기
        </button>
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
              <TabloidLayout article={job.articleData} />
            </div>
          ) : (
            <ThermalLayout article={job.articleData} adData={adData} />
          )}
        </div>
      </div>
    </main>
  )
}
