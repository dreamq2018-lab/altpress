'use client'

import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import QRCode from 'qrcode'
import type { ArticleData } from '@/components/layouts'

interface QRDisplayProps {
  printUrl: string
  articleData: ArticleData
  onReset?: () => void
}

const NAVY = '#1B3A6B'

const wrapStyle: CSSProperties = {
  maxWidth: 460,
  margin: '0 auto',
  padding: '32px 24px',
  background: '#fff',
  borderRadius: 12,
  border: `2px solid ${NAVY}`,
  boxShadow: '0 4px 16px rgba(27,58,107,0.12)',
  fontFamily: "'Nanum Gothic', sans-serif",
  textAlign: 'center',
}

const titleStyle: CSSProperties = {
  fontSize: 22,
  fontWeight: 800,
  color: NAVY,
  marginBottom: 4,
}

const headlinePreviewStyle: CSSProperties = {
  fontFamily: "'Nanum Myeongjo', serif",
  fontSize: 14,
  color: '#444',
  marginBottom: 20,
  fontStyle: 'italic',
}

const qrBoxStyle: CSSProperties = {
  display: 'inline-block',
  padding: 12,
  background: '#fff',
  border: '1px solid #e5e5e5',
  borderRadius: 8,
  marginBottom: 20,
}

const qrImgStyle: CSSProperties = {
  display: 'block',
  width: 200,
  height: 200,
}

const guideStyle: CSSProperties = {
  fontSize: 14,
  color: '#222',
  lineHeight: 1.6,
  marginBottom: 22,
}

const guideStrongStyle: CSSProperties = {
  fontWeight: 700,
  color: NAVY,
}

function buttonStyle(variant: 'primary' | 'ghost'): CSSProperties {
  return {
    display: 'block',
    width: '100%',
    padding: '12px 18px',
    background: variant === 'primary' ? NAVY : '#fff',
    color: variant === 'primary' ? '#fff' : NAVY,
    border: `1.5px solid ${NAVY}`,
    borderRadius: 6,
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    marginBottom: 10,
    fontFamily: 'inherit',
    minHeight: 48,
  }
}

const expiryStyle: CSSProperties = {
  marginTop: 14,
  fontSize: 12,
  color: '#999',
}

const errorStyle: CSSProperties = {
  fontSize: 13,
  color: '#a00',
  marginBottom: 16,
}

export default function QRDisplay({
  printUrl,
  articleData,
  onReset,
}: QRDisplayProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    QRCode.toDataURL(printUrl, {
      width: 200,
      margin: 1,
      color: {
        dark: '#1B3A6B',
        light: '#FFFFFF',
      },
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url)
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : '알 수 없는 오류'
          setError(`QR 생성 실패: ${msg}`)
        }
      })
    return () => {
      cancelled = true
    }
  }, [printUrl])

  return (
    <div style={wrapStyle}>
      <div style={titleStyle}>신문이 완성됐습니다! 🗞</div>
      <div style={headlinePreviewStyle}>{articleData.headline}</div>

      {error && <div style={errorStyle}>⚠ {error}</div>}

      <div style={qrBoxStyle}>
        {qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qrDataUrl} alt="인쇄 QR 코드" style={qrImgStyle} />
        ) : (
          <div
            style={{
              width: 200,
              height: 200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#bbb',
              fontSize: 13,
            }}
          >
            QR 생성 중…
          </div>
        )}
      </div>

      <div style={guideStyle}>
        <strong style={guideStrongStyle}>직원에게 이 화면을 보여주세요</strong>
        <br />
        담당자가 QR을 스캔하면 즉석에서 인쇄됩니다.
      </div>

      <button
        type="button"
        style={buttonStyle('primary')}
        onClick={() => window.open(printUrl, '_blank', 'noopener,noreferrer')}
      >
        🖨 직접 인쇄하기
      </button>

      {onReset && (
        <button type="button" style={buttonStyle('ghost')} onClick={onReset}>
          ↩ 처음으로
        </button>
      )}

      <div style={expiryStyle}>⏱ 24시간 후 만료됩니다</div>
    </div>
  )
}
