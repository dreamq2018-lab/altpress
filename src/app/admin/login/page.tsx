'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { CSSProperties, FormEvent } from 'react'

const NAVY = '#1B3A6B'

const pageStyle: CSSProperties = {
  minHeight: '100vh',
  background: '#f5f5f5',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 20,
  fontFamily: "'Nanum Gothic', sans-serif",
}

const cardStyle: CSSProperties = {
  background: '#fff',
  borderRadius: 12,
  padding: '40px 32px',
  width: '100%',
  maxWidth: 380,
  border: `2px solid ${NAVY}`,
  boxShadow: '0 4px 16px rgba(27,58,107,0.12)',
  textAlign: 'center',
}

const titleStyle: CSSProperties = {
  fontFamily: "'Nanum Myeongjo', serif",
  fontSize: 24,
  fontWeight: 800,
  color: NAVY,
  marginBottom: 8,
}

const subtitleStyle: CSSProperties = {
  fontSize: 13,
  color: '#888',
  marginBottom: 28,
}

const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 700,
  color: NAVY,
  marginBottom: 8,
  textAlign: 'left',
}

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  border: '1.5px solid #ddd',
  borderRadius: 6,
  fontSize: 15,
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  background: '#fff',
  color: '#222',
  marginBottom: 16,
}

const buttonStyle = (enabled: boolean): CSSProperties => ({
  width: '100%',
  padding: '14px 20px',
  background: enabled ? NAVY : '#bbb',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  fontSize: 16,
  fontWeight: 700,
  cursor: enabled ? 'pointer' : 'not-allowed',
  fontFamily: 'inherit',
  minHeight: 52,
})

const errorStyle: CSSProperties = {
  marginTop: 16,
  padding: '12px 14px',
  background: '#fff4f4',
  border: '1px solid #d33',
  borderRadius: 6,
  color: '#a00',
  fontSize: 13,
  lineHeight: 1.5,
}

function LoginInner() {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next') || '/admin'
  const urlError = params.get('error')

  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(
    urlError === 'server_misconfigured'
      ? '서버에 ADMIN_PASSWORD 환경변수가 설정되지 않았습니다. Vercel 설정을 확인해주세요.'
      : null,
  )

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!password) return
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`)
      }
      router.push(next)
      router.refresh()
    } catch (e) {
      const msg = e instanceof Error ? e.message : '알 수 없는 오류'
      setError(msg)
      setSubmitting(false)
    }
  }

  return (
    <main style={pageStyle}>
      <div style={cardStyle}>
        <div style={titleStyle}>관리자 로그인</div>
        <div style={subtitleStyle}>관리자 비밀번호를 입력해주세요</div>

        <form onSubmit={onSubmit}>
          <label style={labelStyle} htmlFor="password">
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            autoFocus
            style={inputStyle}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={submitting}
          />
          <button
            type="submit"
            style={buttonStyle(password.length > 0 && !submitting)}
            disabled={submitting || password.length === 0}
          >
            {submitting ? '로그인 중…' : '로그인'}
          </button>
          {error && <div style={errorStyle}>⚠ {error}</div>}
        </form>
      </div>
    </main>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<main style={pageStyle} />}>
      <LoginInner />
    </Suspense>
  )
}
