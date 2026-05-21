'use client'

import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import QRCode from 'qrcode'

interface LocationDef {
  name: string
  location: string
  media: string
  hanja: string
}

const LOCATIONS: LocationDef[] = [
  { name: '강진 다산초당', location: '강진 다산초당', media: '다산어보', hanja: '茶山語報' },
  { name: '강진 청자박물관', location: '강진 청자박물관', media: '다산어보', hanja: '茶山語報' },
  { name: '강진 가우도', location: '강진 가우도', media: '다산어보', hanja: '茶山語報' },
  { name: '보성 녹차밭', location: '보성 녹차밭', media: '다산어보', hanja: '茶山語報' },
  { name: '고흥 나로우주센터', location: '고흥 나로우주센터', media: '다산어보', hanja: '茶山語報' },
  { name: '장흥 정남진', location: '장흥 정남진', media: '다산어보', hanja: '茶山語報' },
  { name: '장흥 천관산', location: '장흥 천관산', media: '다산어보', hanja: '茶山語報' },
]

const NAVY = '#1B3A6B'

const pageStyle: CSSProperties = {
  minHeight: '100vh',
  background: '#f5f5f5',
  padding: '40px 20px 80px',
  fontFamily: "'Nanum Gothic', sans-serif",
}

const headerStyle: CSSProperties = {
  maxWidth: 1100,
  margin: '0 auto 32px',
  textAlign: 'center',
}

const titleStyle: CSSProperties = {
  fontFamily: "'Nanum Myeongjo', serif",
  fontSize: 28,
  fontWeight: 800,
  color: NAVY,
  marginBottom: 8,
}

const subtitleStyle: CSSProperties = {
  fontSize: 13,
  color: '#777',
}

const gridStyle: CSSProperties = {
  maxWidth: 1100,
  margin: '0 auto',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: 16,
}

const cardStyle: CSSProperties = {
  background: '#fff',
  border: '1.5px solid #ddd',
  borderRadius: 10,
  padding: 18,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 12,
}

const cardTitleStyle: CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
  color: NAVY,
}

const qrBoxStyle: CSSProperties = {
  padding: 10,
  background: '#fff',
  border: '1px solid #e5e5e5',
  borderRadius: 6,
}

const urlStyle: CSSProperties = {
  fontSize: 11,
  color: '#777',
  textAlign: 'center',
  wordBreak: 'break-all',
  fontFamily: 'monospace',
  background: '#f7f7f7',
  padding: '6px 10px',
  borderRadius: 4,
  width: '100%',
  boxSizing: 'border-box',
}

const downloadButtonStyle: CSSProperties = {
  background: NAVY,
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  padding: '8px 16px',
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'inherit',
  width: '100%',
  minHeight: 40,
}

function buildLocationUrl(siteUrl: string, loc: LocationDef): string {
  const base = siteUrl.replace(/\/$/, '')
  const params = new URLSearchParams({
    location: loc.location,
    media: loc.media,
    hanja: loc.hanja,
    mode: 'sixW',
  })
  return `${base}/?${params.toString()}`
}

interface QRCardProps {
  loc: LocationDef
  siteUrl: string
}

function QRCard({ loc, siteUrl }: QRCardProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const url = buildLocationUrl(siteUrl, loc)

  useEffect(() => {
    let cancelled = false
    QRCode.toDataURL(url, {
      width: 240,
      margin: 1,
      color: { dark: NAVY, light: '#FFFFFF' },
    }).then((d) => {
      if (!cancelled) setDataUrl(d)
    })
    // 고해상도 다운로드용 canvas 별도 렌더
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 800,
        margin: 2,
        color: { dark: NAVY, light: '#FFFFFF' },
      }).catch(() => {})
    }
    return () => {
      cancelled = true
    }
  }, [url])

  const download = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `altpress-qr-${loc.location}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <div style={cardStyle}>
      <div style={cardTitleStyle}>{loc.name}</div>
      <div style={qrBoxStyle}>
        {dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={dataUrl}
            alt={`${loc.name} QR`}
            style={{ display: 'block', width: 200, height: 200 }}
          />
        ) : (
          <div
            style={{
              width: 200,
              height: 200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#bbb',
              fontSize: 12,
            }}
          >
            QR 생성 중…
          </div>
        )}
      </div>
      <div style={urlStyle}>{url}</div>
      {/* 고해상도 다운로드용 hidden canvas */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <button type="button" style={downloadButtonStyle} onClick={download}>
        ⬇ 이미지로 저장 (PNG 800px)
      </button>
    </div>
  )
}

export default function QRAdminPage() {
  // siteUrl은 클라이언트 사이드에서 결정. NEXT_PUBLIC_SITE_URL > origin
  const [siteUrl, setSiteUrl] = useState<string>('')

  useEffect(() => {
    const fromEnv = process.env.NEXT_PUBLIC_SITE_URL
    setSiteUrl(fromEnv || window.location.origin)
  }, [])

  return (
    <main style={pageStyle}>
      <header style={headerStyle}>
        <div style={titleStyle}>관광지별 QR 코드</div>
        <div style={subtitleStyle}>
          부스에 인쇄해서 거치하세요. 스캔하면 해당 관광지가 미리 채워진 폼이 열립니다.
        </div>
      </header>

      <div style={gridStyle}>
        {siteUrl &&
          LOCATIONS.map((loc) => (
            <QRCard key={loc.name} loc={loc} siteUrl={siteUrl} />
          ))}
      </div>
    </main>
  )
}
