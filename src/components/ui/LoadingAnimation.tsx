'use client'

import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'

const MESSAGES = [
  '취재 내용을 분석하고 있습니다...',
  '헤드라인을 작성하고 있습니다...',
  '본문 기사를 완성하고 있습니다...',
]

const CYCLE_MS = 2000
const TYPING_SPEED_MS = 35

const overlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: '#fff',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 100,
}

const logoStyle: CSSProperties = {
  fontFamily: "'Nanum Myeongjo', serif",
  fontSize: 48,
  fontWeight: 800,
  color: '#1B3A6B',
  letterSpacing: 4,
  marginBottom: 12,
}

const subtitleStyle: CSSProperties = {
  fontFamily: "'Nanum Gothic', sans-serif",
  fontSize: 14,
  color: '#666',
  marginBottom: 32,
}

const typingLineStyle: CSSProperties = {
  fontFamily: "'Nanum Gothic', sans-serif",
  fontSize: 16,
  color: '#1B3A6B',
  fontWeight: 700,
  height: 28,
  display: 'flex',
  alignItems: 'center',
  letterSpacing: '-0.3px',
}

const cursorStyle: CSSProperties = {
  display: 'inline-block',
  width: 2,
  height: 18,
  background: '#1B3A6B',
  marginLeft: 4,
  animation: 'altpress-blink 1s infinite',
}

const footerStyle: CSSProperties = {
  marginTop: 48,
  fontFamily: "'Nanum Gothic', sans-serif",
  fontSize: 13,
  color: '#999',
  textAlign: 'center',
  lineHeight: 1.6,
}

export default function LoadingAnimation() {
  const [messageIdx, setMessageIdx] = useState(0)
  const [displayed, setDisplayed] = useState('')

  useEffect(() => {
    const target = MESSAGES[messageIdx]
    setDisplayed('')
    let i = 0
    const typer = setInterval(() => {
      i += 1
      setDisplayed(target.slice(0, i))
      if (i >= target.length) clearInterval(typer)
    }, TYPING_SPEED_MS)

    const advance = setTimeout(() => {
      setMessageIdx((prev) => (prev + 1) % MESSAGES.length)
    }, CYCLE_MS)

    return () => {
      clearInterval(typer)
      clearTimeout(advance)
    }
  }, [messageIdx])

  return (
    <div style={overlayStyle}>
      <style>{`
        @keyframes altpress-blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
      <div style={logoStyle}>茶山語報</div>
      <div style={subtitleStyle}>다산어보</div>
      <div style={typingLineStyle}>
        {displayed}
        <span style={cursorStyle} />
      </div>
      <div style={footerStyle}>
        기사를 작성하고 있습니다
        <br />
        잠시만 기다려 주세요
      </div>
    </div>
  )
}
