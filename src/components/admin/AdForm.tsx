'use client'

import { useState } from 'react'
import type { CSSProperties } from 'react'
import { type AdInput } from '@/lib/ads'
import { ALL_LOCATIONS_TOKEN, LOCATIONS } from '@/lib/locations'

interface AdFormProps {
  initial?: AdInput
  onSubmit: (value: AdInput) => Promise<void>
  submitLabel: string
}

const NAVY = '#1B3A6B'
const MAX_MESSAGE = 30
const MAX_SUB_MESSAGE = 20

const wrapStyle: CSSProperties = {
  background: '#fff',
  borderRadius: 12,
  padding: '24px',
  border: '1.5px solid #e5e5e5',
  maxWidth: 720,
}

const fieldStyle: CSSProperties = { marginBottom: 22 }

const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 700,
  color: NAVY,
  marginBottom: 6,
}

const reqStyle: CSSProperties = { color: '#d33', marginLeft: 4 }

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1.5px solid #ddd',
  borderRadius: 6,
  fontSize: 14,
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  background: '#fff',
  color: '#222',
}

const counterStyle = (ok: boolean): CSSProperties => ({
  fontSize: 12,
  color: ok ? '#0a8043' : '#999',
  textAlign: 'right',
  marginTop: 4,
  fontWeight: ok ? 700 : 400,
})

const checkboxGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: 8,
}

const checkboxItemStyle = (checked: boolean): CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '10px 12px',
  border: `1.5px solid ${checked ? NAVY : '#ddd'}`,
  borderRadius: 6,
  background: checked ? '#f3f6fb' : '#fff',
  cursor: 'pointer',
  fontSize: 14,
  userSelect: 'none',
})

const dateRowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 12,
}

const submitBtnStyle = (enabled: boolean): CSSProperties => ({
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
})

const errorStyle: CSSProperties = {
  background: '#fff4f4',
  border: '1px solid #d33',
  padding: '12px 16px',
  borderRadius: 6,
  color: '#a00',
  marginBottom: 16,
  fontSize: 13,
}

export default function AdForm({
  initial,
  onSubmit,
  submitLabel,
}: AdFormProps) {
  const [advertiser, setAdvertiser] = useState(initial?.advertiser ?? '')
  const [message, setMessage] = useState(initial?.message ?? '')
  const [subMessage, setSubMessage] = useState(initial?.sub_message ?? '')
  const [locs, setLocs] = useState<string[]>(initial?.locations ?? [])
  const [startsAt, setStartsAt] = useState(initial?.starts_at ?? '')
  const [endsAt, setEndsAt] = useState(initial?.ends_at ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const messageOk =
    message.trim().length > 0 && message.length <= MAX_MESSAGE
  const subOk = subMessage.length <= MAX_SUB_MESSAGE
  const isValid =
    advertiser.trim().length > 0 &&
    messageOk &&
    subOk &&
    locs.length > 0

  const toggleLoc = (loc: string) => {
    setLocs((prev) =>
      prev.includes(loc) ? prev.filter((l) => l !== loc) : [...prev, loc],
    )
  }

  const allOptions: string[] = [...LOCATIONS, ALL_LOCATIONS_TOKEN]

  const handleSubmit = async () => {
    if (!isValid || submitting) return
    setError(null)
    setSubmitting(true)
    try {
      await onSubmit({
        advertiser: advertiser.trim(),
        message: message.trim(),
        sub_message: subMessage.trim() || undefined,
        locations: locs,
        starts_at: startsAt || undefined,
        ends_at: endsAt || undefined,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : '저장 실패')
      setSubmitting(false)
    }
  }

  return (
    <div style={wrapStyle}>
      {error && <div style={errorStyle}>⚠ {error}</div>}

      <div style={fieldStyle}>
        <label style={labelStyle}>
          광고주명<span style={reqStyle}>*</span>
        </label>
        <input
          style={inputStyle}
          value={advertiser}
          onChange={(e) => setAdvertiser(e.target.value)}
          placeholder="예: 강진 한정식"
        />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>
          광고 문구<span style={reqStyle}>*</span>
          <span style={{ marginLeft: 6, fontWeight: 400, color: '#999', fontSize: 12 }}>
            (최대 {MAX_MESSAGE}자)
          </span>
        </label>
        <input
          style={inputStyle}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="예: 정약용 선생도 즐긴 강진의 맛"
          maxLength={MAX_MESSAGE + 10}
        />
        <div style={counterStyle(messageOk)}>
          {message.length} / {MAX_MESSAGE}자
        </div>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>
          부가 문구
          <span style={{ marginLeft: 6, fontWeight: 400, color: '#999', fontSize: 12 }}>
            (선택, 최대 {MAX_SUB_MESSAGE}자)
          </span>
        </label>
        <input
          style={inputStyle}
          value={subMessage}
          onChange={(e) => setSubMessage(e.target.value)}
          placeholder="예: 다산초당 도보 5분"
          maxLength={MAX_SUB_MESSAGE + 10}
        />
        <div style={counterStyle(subOk)}>
          {subMessage.length} / {MAX_SUB_MESSAGE}자
        </div>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>
          적용 관광지<span style={reqStyle}>*</span>
          <span style={{ marginLeft: 6, fontWeight: 400, color: '#999', fontSize: 12 }}>
            (복수 선택 가능)
          </span>
        </label>
        <div style={checkboxGridStyle}>
          {allOptions.map((loc) => {
            const checked = locs.includes(loc)
            return (
              <label key={loc} style={checkboxItemStyle(checked)}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleLoc(loc)}
                />
                <span>{loc === ALL_LOCATIONS_TOKEN ? '전체 (모든 지역)' : loc}</span>
              </label>
            )
          })}
        </div>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>
          게재 기간
          <span style={{ marginLeft: 6, fontWeight: 400, color: '#999', fontSize: 12 }}>
            (선택)
          </span>
        </label>
        <div style={dateRowStyle}>
          <input
            type="date"
            style={inputStyle}
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
          />
          <input
            type="date"
            style={inputStyle}
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
          />
        </div>
      </div>

      <button
        type="button"
        style={submitBtnStyle(isValid && !submitting)}
        disabled={!isValid || submitting}
        onClick={handleSubmit}
      >
        {submitting ? '저장 중…' : submitLabel}
      </button>
    </div>
  )
}
