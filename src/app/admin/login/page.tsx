'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import type { CSSProperties, FormEvent } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'

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
  maxWidth: 420,
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

const noticeStyle = (variant: 'success' | 'error'): CSSProperties => ({
  marginTop: 16,
  padding: '12px 14px',
  background: variant === 'success' ? '#e6f4ea' : '#fff4f4',
  border: `1px solid ${variant === 'success' ? '#0a8043' : '#d33'}`,
  borderRadius: 6,
  color: variant === 'success' ? '#0a5d31' : '#a00',
  fontSize: 13,
  lineHeight: 1.5,
})

const hintStyle: CSSProperties = {
  marginTop: 20,
  fontSize: 11,
  color: '#aaa',
  lineHeight: 1.5,
}

function LoginInner() {
  const params = useSearchParams()
  const next = params.get('next') || '/admin'
  const urlError = params.get('error')

  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [error, setError] = useState<string | null>(urlError)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) return
    setStatus('sending')
    setError(null)

    try {
      const supabase = createSupabaseBrowserClient()
      const origin = window.location.origin
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: {
          emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      })
      if (signInError) throw signInError
      setStatus('sent')
    } catch (e) {
      const msg = e instanceof Error ? e.message : '알 수 없는 오류'
      setError(msg)
      setStatus('idle')
    }
  }

  return (
    <main style={pageStyle}>
      <div style={cardStyle}>
        <div style={titleStyle}>관리자 로그인</div>
        <div style={subtitleStyle}>등록된 관리자 이메일로 매직 링크를 보내드립니다</div>

        {status === 'sent' ? (
          <div style={noticeStyle('success')}>
            ✓ <strong>{email}</strong> 으로 로그인 링크를 보냈습니다.
            <br />
            메일을 확인하고 링크를 클릭하면 자동으로 로그인됩니다.
          </div>
        ) : (
          <form onSubmit={onSubmit}>
            <label style={labelStyle} htmlFor="email">
              이메일
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              style={inputStyle}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              disabled={status === 'sending'}
            />
            <button
              type="submit"
              style={buttonStyle(
                email.trim().length > 0 && status === 'idle',
              )}
              disabled={status === 'sending' || email.trim().length === 0}
            >
              {status === 'sending' ? '전송 중…' : '로그인 링크 보내기'}
            </button>
            {error && <div style={noticeStyle('error')}>⚠ {error}</div>}
          </form>
        )}

        <div style={hintStyle}>
          허용된 이메일만 관리자 페이지에 접근할 수 있습니다.
          <br />
          비허용 이메일로 로그인은 가능하지만 관리자 페이지는 보이지 않습니다.
        </div>
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
