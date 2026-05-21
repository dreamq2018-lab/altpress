'use client'

import type { CSSProperties } from 'react'

const buttonStyle: CSSProperties = {
  background: '#fff',
  color: '#1B3A6B',
  border: '2px solid #fff',
  borderRadius: 6,
  padding: '12px 22px',
  fontSize: 15,
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: "'Nanum Gothic', sans-serif",
}

export default function PrintButton() {
  return (
    <button
      type="button"
      style={buttonStyle}
      onClick={() => window.print()}
    >
      🖨 인쇄
    </button>
  )
}
