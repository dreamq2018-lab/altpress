'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { useDropzone } from 'react-dropzone'
import type { ArticleType } from '@/components/layouts'

export type LayoutChoice = 'thermal' | 'tabloid'
export type InputMode = 'free' | 'sixW'

export interface ArticleFormValue {
  type: ArticleType
  layout: LayoutChoice
  mediaName: string
  mediaNameHanja: string
  location: string
  date: string
  authorName: string
  content: string
  photos: string[]
}

interface ArticleFormProps {
  onSubmit: (value: ArticleFormValue) => void
}

const NAVY = '#1B3A6B'
const MIN_CONTENT = 50
const MAX_PHOTOS = 3

const TYPE_OPTIONS: Array<{
  value: ArticleType
  icon: string
  title: string
  subtitle: string
}> = [
  { value: 'travel', icon: '✈', title: '여행', subtitle: '체험 기사' },
  { value: 'reporter', icon: '📢', title: '리포터', subtitle: '마을 소식' },
  { value: 'editor', icon: '✏', title: '직접 입력', subtitle: '편집자용' },
]

const todayISO = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const containerStyle: CSSProperties = {
  maxWidth: 720,
  margin: '0 auto',
  padding: '0 16px 80px',
  fontFamily: "'Nanum Gothic', sans-serif",
}

const sectionStyle: CSSProperties = {
  marginBottom: 28,
}

const sectionTitleStyle: CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: NAVY,
  marginBottom: 10,
  letterSpacing: '-0.3px',
}

const sectionRequiredStyle: CSSProperties = {
  marginLeft: 4,
  color: '#d33',
  fontWeight: 700,
}

const typeGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 10,
}

function typeCardStyle(selected: boolean, locked: boolean): CSSProperties {
  return {
    border: `2px solid ${selected ? NAVY : '#ddd'}`,
    borderRadius: 8,
    padding: '18px 12px',
    textAlign: 'center',
    cursor: locked ? 'not-allowed' : 'pointer',
    background: selected ? '#f3f6fb' : '#fff',
    transition: 'all 0.15s',
    opacity: locked && !selected ? 0.4 : 1,
  }
}

const typeIconStyle: CSSProperties = {
  fontSize: 28,
  lineHeight: 1,
  marginBottom: 6,
}

const typeTitleStyle: CSSProperties = {
  fontSize: 15,
  fontWeight: 700,
  color: '#222',
}

const typeSubtitleStyle: CSSProperties = {
  fontSize: 12,
  color: '#777',
  marginTop: 2,
}

const lockedHintStyle: CSSProperties = {
  marginTop: 8,
  fontSize: 12,
  color: '#888',
  fontStyle: 'italic',
}

const layoutRowStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
}

function layoutOptionStyle(selected: boolean): CSSProperties {
  return {
    border: `1.5px solid ${selected ? NAVY : '#ddd'}`,
    borderRadius: 6,
    padding: '12px 14px',
    cursor: 'pointer',
    background: selected ? '#f3f6fb' : '#fff',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  }
}

const radioDotStyle = (selected: boolean): CSSProperties => ({
  width: 16,
  height: 16,
  borderRadius: '50%',
  border: `2px solid ${selected ? NAVY : '#999'}`,
  background: selected ? NAVY : '#fff',
  boxShadow: selected ? 'inset 0 0 0 3px #fff' : 'none',
  flex: '0 0 auto',
})

const fieldRowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 12,
}

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  border: '1.5px solid #ddd',
  borderRadius: 6,
  fontSize: 14,
  fontFamily: 'inherit',
  color: '#222',
  background: '#fff',
  outline: 'none',
  boxSizing: 'border-box',
  minHeight: 44,
}

const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: 12,
  color: '#666',
  marginBottom: 6,
  fontWeight: 500,
}

const textareaStyle: CSSProperties = {
  ...inputStyle,
  minHeight: 140,
  resize: 'vertical',
  lineHeight: 1.6,
}

function counterStyle(ok: boolean): CSSProperties {
  return {
    fontSize: 12,
    color: ok ? '#0a8' : '#999',
    textAlign: 'right',
    marginTop: 4,
    fontWeight: ok ? 700 : 400,
  }
}

// Tab UI
const tabRowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 0,
  marginBottom: 16,
  border: '1.5px solid #ddd',
  borderRadius: 8,
  overflow: 'hidden',
}

function tabButtonStyle(active: boolean, side: 'left' | 'right'): CSSProperties {
  return {
    padding: '14px 10px',
    background: active ? NAVY : '#fff',
    color: active ? '#fff' : '#666',
    border: 'none',
    borderRight: side === 'left' ? '1.5px solid #ddd' : 'none',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.15s',
    minHeight: 48,
  }
}

// SixW cards
const sixwGridStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
}

const sixwCardStyle: CSSProperties = {
  border: '1.5px solid #ddd',
  borderRadius: 8,
  padding: '12px 14px',
  background: '#fff',
}

const sixwHeaderStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  marginBottom: 8,
  fontSize: 13,
  fontWeight: 700,
  color: NAVY,
}

const sixwIconStyle: CSSProperties = {
  fontSize: 18,
  lineHeight: 1,
}

const sixwInputStyle: CSSProperties = {
  ...inputStyle,
  minHeight: 48,
}

const sixwHintStyle: CSSProperties = {
  fontSize: 11,
  color: '#888',
  marginTop: 6,
  fontStyle: 'italic',
}

const sixwBadgeStyle: CSSProperties = {
  display: 'inline-block',
  fontSize: 10,
  fontWeight: 700,
  padding: '2px 6px',
  borderRadius: 4,
  marginLeft: 6,
}

function dropzoneStyle(active: boolean): CSSProperties {
  return {
    border: `2px dashed ${active ? NAVY : '#bbb'}`,
    borderRadius: 8,
    padding: '24px 16px',
    textAlign: 'center',
    background: active ? '#f3f6fb' : '#fafafa',
    color: '#666',
    cursor: 'pointer',
    transition: 'all 0.15s',
  }
}

const thumbsRowStyle: CSSProperties = {
  display: 'flex',
  gap: 8,
  marginTop: 12,
  flexWrap: 'wrap',
}

const thumbStyle: CSSProperties = {
  position: 'relative',
  width: 96,
  height: 96,
  borderRadius: 6,
  overflow: 'hidden',
  border: '1px solid #ddd',
}

const thumbImgStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
}

const thumbRemoveStyle: CSSProperties = {
  position: 'absolute',
  top: 4,
  right: 4,
  width: 22,
  height: 22,
  borderRadius: '50%',
  background: 'rgba(0,0,0,0.7)',
  color: '#fff',
  border: 'none',
  fontSize: 14,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  lineHeight: 1,
}

function submitButtonStyle(enabled: boolean): CSSProperties {
  return {
    width: '100%',
    padding: '14px 20px',
    background: enabled ? NAVY : '#bbb',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 700,
    cursor: enabled ? 'pointer' : 'not-allowed',
    marginTop: 12,
    letterSpacing: '0.5px',
    minHeight: 56,
  }
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error ?? new Error('read failed'))
    reader.readAsDataURL(file)
  })
}

export default function ArticleForm({ onSubmit }: ArticleFormProps) {
  const [type, setType] = useState<ArticleType>('travel')
  const [layout, setLayout] = useState<LayoutChoice>('thermal')
  const [mediaName, setMediaName] = useState('다산어보')
  const [mediaNameHanja, setMediaNameHanja] = useState('茶山語報')
  const [location, setLocation] = useState('')
  const [date, setDate] = useState(todayISO())
  const [authorName, setAuthorName] = useState('')
  const [photos, setPhotos] = useState<string[]>([])

  // 입력 모드: 자유 입력 / 육하원칙
  const [inputMode, setInputMode] = useState<InputMode>('free')

  // URL 파라미터로 초기 진입값 채움 (QR 거치대용)
  //   ?mode=sixW       → 육하원칙 탭으로 시작
  //   ?location=...    → 장소 prefill
  //   ?media=...       → 언론사명 prefill
  //   ?hanja=...       → 한자명 prefill
  // useEffect로 마운트 후 동기화 → SSR/CSR hydration mismatch 회피
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('mode') === 'sixW') setInputMode('sixW')
    const locParam = params.get('location')
    if (locParam) setLocation(locParam)
    const mediaParam = params.get('media')
    if (mediaParam) setMediaName(mediaParam)
    const hanjaParam = params.get('hanja')
    if (hanjaParam) setMediaNameHanja(hanjaParam)
  }, [])

  // 자유 입력
  const [content, setContent] = useState('')

  // 육하원칙
  const [who, setWho] = useState('')
  const [whenField, setWhenField] = useState('')
  const [whatField, setWhatField] = useState('')
  const [howField, setHowField] = useState('')
  const [whyField, setWhyField] = useState('')

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const room = MAX_PHOTOS - photos.length
      if (room <= 0) return
      const toRead = acceptedFiles.slice(0, room)
      const dataUrls = await Promise.all(toRead.map(fileToDataUrl))
      setPhotos((prev) => [...prev, ...dataUrls].slice(0, MAX_PHOTOS))
    },
    [photos.length],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: MAX_PHOTOS - photos.length,
    disabled: photos.length >= MAX_PHOTOS,
  })

  // 자유 모드 검증
  const freeContentOk = content.trim().length >= MIN_CONTENT

  // 육하원칙 필수 카운트 (어디서·무엇을·어떻게)
  const sixWRequiredCount = useMemo(
    () =>
      [location.trim(), whatField.trim(), howField.trim()].filter(Boolean)
        .length,
    [location, whatField, howField],
  )
  const sixWOk = sixWRequiredCount === 3

  const contentOk = inputMode === 'free' ? freeContentOk : sixWOk

  const isValid = useMemo(
    () =>
      Boolean(mediaName.trim()) &&
      Boolean(authorName.trim()) &&
      Boolean(location.trim()) &&
      contentOk,
    [mediaName, authorName, location, contentOk],
  )

  const switchInputMode = (target: InputMode) => {
    if (target === inputMode) return
    // 현재 탭에 입력된 내용 확인
    const hasFreeData = content.trim().length > 0
    const hasSixWData = [who, whenField, whatField, howField, whyField].some(
      (v) => v.trim().length > 0,
    )
    const hasCurrentData =
      inputMode === 'free' ? hasFreeData : hasSixWData
    if (hasCurrentData) {
      const ok = window.confirm(
        '입력한 내용이 사라집니다. 그래도 전환하시겠습니까?',
      )
      if (!ok) return
    }
    // 현재 모드 데이터 초기화
    if (inputMode === 'free') {
      setContent('')
    } else {
      setWho('')
      setWhenField('')
      setWhatField('')
      setHowField('')
      setWhyField('')
    }
    setInputMode(target)
  }

  const handleSubmit = () => {
    if (!isValid) return

    let finalType: ArticleType = type
    let finalContent = content

    if (inputMode === 'sixW') {
      finalType = 'reporter' // 육하원칙은 리포터 스타일 고정
      finalContent =
        `누가: ${who.trim()}\n` +
        `언제: ${whenField.trim()}\n` +
        `어디서: ${location.trim()}\n` +
        `무엇을: ${whatField.trim()}\n` +
        `어떻게: ${howField.trim()}\n` +
        `왜: ${whyField.trim()}`
    }

    onSubmit({
      type: finalType,
      layout,
      mediaName: mediaName.trim(),
      mediaNameHanja: mediaNameHanja.trim(),
      location: location.trim(),
      date,
      authorName: authorName.trim(),
      content: finalContent,
      photos,
    })
  }

  const removePhoto = (idx: number) =>
    setPhotos((prev) => prev.filter((_, i) => i !== idx))

  const typeLocked = inputMode === 'sixW'

  return (
    <div style={containerStyle}>
      {/* 1. 기사 유형 */}
      <section style={sectionStyle}>
        <div style={sectionTitleStyle}>
          기사 유형<span style={sectionRequiredStyle}>*</span>
        </div>
        <div style={typeGridStyle} role="radiogroup" aria-label="기사 유형">
          {TYPE_OPTIONS.map((opt) => {
            const isReporter = opt.value === 'reporter'
            const selected = typeLocked ? isReporter : type === opt.value
            const locked = typeLocked && !isReporter
            return (
              <div
                key={opt.value}
                role="radio"
                aria-checked={selected}
                aria-disabled={locked}
                tabIndex={locked ? -1 : 0}
                onClick={() => {
                  if (locked) return
                  if (!typeLocked) setType(opt.value)
                }}
                onKeyDown={(e) => {
                  if (locked) return
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    if (!typeLocked) setType(opt.value)
                  }
                }}
                style={typeCardStyle(selected, locked)}
              >
                <div style={typeIconStyle}>{opt.icon}</div>
                <div style={typeTitleStyle}>{opt.title}</div>
                <div style={typeSubtitleStyle}>{opt.subtitle}</div>
              </div>
            )
          })}
        </div>
        {typeLocked && (
          <div style={lockedHintStyle}>
            육하원칙 모드에서는 「리포터」 스타일로 자동 작성됩니다.
          </div>
        )}
      </section>

      {/* 2. 레이아웃 */}
      <section style={sectionStyle}>
        <div style={sectionTitleStyle}>
          레이아웃<span style={sectionRequiredStyle}>*</span>
        </div>
        <div style={layoutRowStyle} role="radiogroup" aria-label="레이아웃">
          {(
            [
              {
                value: 'thermal' as LayoutChoice,
                title: '감열 두루마리 (80mm)',
                hint: '즉석 체험용',
              },
              {
                value: 'tabloid' as LayoutChoice,
                title: '타블로이드 (279×432mm)',
                hint: '정식 신문용',
              },
            ]
          ).map((opt) => {
            const selected = layout === opt.value
            return (
              <div
                key={opt.value}
                role="radio"
                aria-checked={selected}
                tabIndex={0}
                onClick={() => setLayout(opt.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setLayout(opt.value)
                  }
                }}
                style={layoutOptionStyle(selected)}
              >
                <span style={radioDotStyle(selected)} />
                <span style={{ fontSize: 14, fontWeight: 700, color: '#222' }}>
                  {opt.title}
                </span>
                <span style={{ fontSize: 12, color: '#888' }}>
                  — {opt.hint}
                </span>
              </div>
            )
          })}
        </div>
      </section>

      {/* 3. 언론사 정보 */}
      <section style={sectionStyle}>
        <div style={sectionTitleStyle}>언론사 정보</div>
        <div style={fieldRowStyle}>
          <div>
            <label style={labelStyle} htmlFor="mediaName">
              언론사명
            </label>
            <input
              id="mediaName"
              style={inputStyle}
              value={mediaName}
              onChange={(e) => setMediaName(e.target.value)}
              placeholder="다산어보"
            />
          </div>
          <div>
            <label style={labelStyle} htmlFor="mediaNameHanja">
              한자명
            </label>
            <input
              id="mediaNameHanja"
              style={inputStyle}
              value={mediaNameHanja}
              onChange={(e) => setMediaNameHanja(e.target.value)}
              placeholder="茶山語報"
            />
          </div>
        </div>
      </section>

      {/* 4. 기사 정보 */}
      <section style={sectionStyle}>
        <div style={sectionTitleStyle}>
          기사 정보<span style={sectionRequiredStyle}>*</span>
        </div>
        <div style={{ ...fieldRowStyle, marginBottom: 12 }}>
          <div>
            <label style={labelStyle} htmlFor="location">
              장소 <span style={sectionRequiredStyle}>*</span>
            </label>
            <input
              id="location"
              style={inputStyle}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="예: 강진 다산초당"
            />
          </div>
          <div>
            <label style={labelStyle} htmlFor="date">
              날짜
            </label>
            <input
              id="date"
              type="date"
              style={inputStyle}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label style={labelStyle} htmlFor="authorName">
            작성자 이름 <span style={sectionRequiredStyle}>*</span>
          </label>
          <input
            id="authorName"
            style={inputStyle}
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="예: 이득규"
          />
        </div>
      </section>

      {/* 5. 내용 — 탭 분기 */}
      <section style={sectionStyle}>
        <div style={sectionTitleStyle}>
          내용<span style={sectionRequiredStyle}>*</span>
        </div>

        {/* 입력 방식 탭 */}
        <div style={tabRowStyle} role="tablist" aria-label="입력 방식">
          <button
            type="button"
            role="tab"
            aria-selected={inputMode === 'free'}
            onClick={() => switchInputMode('free')}
            style={tabButtonStyle(inputMode === 'free', 'left')}
          >
            ✏ 자유 입력
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={inputMode === 'sixW'}
            onClick={() => switchInputMode('sixW')}
            style={tabButtonStyle(inputMode === 'sixW', 'right')}
          >
            📋 육하원칙
          </button>
        </div>

        {inputMode === 'free' ? (
          <>
            <textarea
              style={textareaStyle}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="이곳에서 보고 느낀 것을 자유롭게 써주세요.&#10;글을 잘 못 써도 괜찮습니다. AI가 기사로 만들어드립니다."
              aria-label="자유 입력 내용"
            />
            <div style={counterStyle(freeContentOk)}>
              {content.trim().length} / {MIN_CONTENT}자
              {freeContentOk ? ' ✓' : ''}
            </div>
          </>
        ) : (
          <>
            <div style={sixwGridStyle}>
              {/* 누가 */}
              <div style={sixwCardStyle}>
                <div style={sixwHeaderStyle}>
                  <span style={sixwIconStyle}>👤</span>
                  <span>누가</span>
                  <span
                    style={{
                      ...sixwBadgeStyle,
                      background: '#f0f0f0',
                      color: '#999',
                    }}
                  >
                    선택
                  </span>
                </div>
                <input
                  style={sixwInputStyle}
                  value={who}
                  onChange={(e) => setWho(e.target.value)}
                  placeholder="예) 강진에 사는 60대 농부 김씨"
                />
              </div>

              {/* 언제 */}
              <div style={sixwCardStyle}>
                <div style={sixwHeaderStyle}>
                  <span style={sixwIconStyle}>🕐</span>
                  <span>언제</span>
                  <span
                    style={{
                      ...sixwBadgeStyle,
                      background: '#f0f0f0',
                      color: '#999',
                    }}
                  >
                    선택
                  </span>
                </div>
                <input
                  style={sixwInputStyle}
                  value={whenField}
                  onChange={(e) => setWhenField(e.target.value)}
                  placeholder="예) 오늘 오후 2시"
                />
              </div>

              {/* 어디서 — location과 자동 연결 */}
              <div style={sixwCardStyle}>
                <div style={sixwHeaderStyle}>
                  <span style={sixwIconStyle}>📍</span>
                  <span>어디서</span>
                  <span
                    style={{
                      ...sixwBadgeStyle,
                      background: '#fee',
                      color: '#d33',
                    }}
                  >
                    필수
                  </span>
                </div>
                <input
                  style={sixwInputStyle}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="예) 강진 다산초당"
                />
                <div style={sixwHintStyle}>
                  ↑ 위 「기사 정보」의 장소와 자동 연결됩니다
                </div>
              </div>

              {/* 무엇을 */}
              <div style={sixwCardStyle}>
                <div style={sixwHeaderStyle}>
                  <span style={sixwIconStyle}>🎯</span>
                  <span>무엇을</span>
                  <span
                    style={{
                      ...sixwBadgeStyle,
                      background: '#fee',
                      color: '#d33',
                    }}
                  >
                    필수
                  </span>
                </div>
                <input
                  style={sixwInputStyle}
                  value={whatField}
                  onChange={(e) => setWhatField(e.target.value)}
                  placeholder="예) 다산초당을 처음 방문했습니다"
                />
              </div>

              {/* 어떻게 */}
              <div style={sixwCardStyle}>
                <div style={sixwHeaderStyle}>
                  <span style={sixwIconStyle}>💬</span>
                  <span>어떻게 (느낌·상황)</span>
                  <span
                    style={{
                      ...sixwBadgeStyle,
                      background: '#fee',
                      color: '#d33',
                    }}
                  >
                    필수
                  </span>
                </div>
                <input
                  style={sixwInputStyle}
                  value={howField}
                  onChange={(e) => setHowField(e.target.value)}
                  placeholder="예) 소나무 숲길이 인상적이었고 조용해서 좋았습니다"
                />
              </div>

              {/* 왜 */}
              <div style={sixwCardStyle}>
                <div style={sixwHeaderStyle}>
                  <span style={sixwIconStyle}>❓</span>
                  <span>왜 (방문 이유)</span>
                  <span
                    style={{
                      ...sixwBadgeStyle,
                      background: '#f0f0f0',
                      color: '#999',
                    }}
                  >
                    선택
                  </span>
                </div>
                <input
                  style={sixwInputStyle}
                  value={whyField}
                  onChange={(e) => setWhyField(e.target.value)}
                  placeholder="예) 가족 여행으로 전남 역사 탐방을 하고 있습니다"
                />
              </div>
            </div>
            <div style={counterStyle(sixWOk)}>
              필수 항목 3개 중 {sixWRequiredCount}개 입력됨
              {sixWOk ? ' ✓' : ''}
            </div>
          </>
        )}
      </section>

      {/* 6. 사진 */}
      <section style={sectionStyle}>
        <div style={sectionTitleStyle}>
          사진 업로드
          <span
            style={{
              marginLeft: 6,
              fontWeight: 400,
              color: '#999',
              fontSize: 12,
            }}
          >
            (선택, 최대 {MAX_PHOTOS}장)
          </span>
        </div>
        <div
          {...getRootProps()}
          style={dropzoneStyle(isDragActive)}
          aria-label="사진을 끌어다 놓거나 클릭하여 업로드"
        >
          <input {...getInputProps()} />
          <div style={{ fontSize: 24, marginBottom: 4 }}>📷</div>
          {photos.length >= MAX_PHOTOS ? (
            <div style={{ fontSize: 13 }}>
              최대 {MAX_PHOTOS}장까지 업로드했습니다.
            </div>
          ) : isDragActive ? (
            <div style={{ fontSize: 13 }}>여기에 놓으세요</div>
          ) : (
            <div style={{ fontSize: 13 }}>
              사진을 끌어다 놓거나 클릭하여 업로드 ({photos.length}/{MAX_PHOTOS})
            </div>
          )}
        </div>
        {photos.length > 0 && (
          <div style={thumbsRowStyle}>
            {photos.map((src, i) => (
              <div key={i} style={thumbStyle}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`업로드 사진 ${i + 1}`}
                  style={thumbImgStyle}
                />
                <button
                  type="button"
                  style={thumbRemoveStyle}
                  onClick={() => removePhoto(i)}
                  aria-label={`사진 ${i + 1} 제거`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 7. 제출 */}
      <button
        type="button"
        style={submitButtonStyle(isValid)}
        disabled={!isValid}
        onClick={handleSubmit}
      >
        기사 만들기
      </button>
      {!isValid && (
        <div
          style={{
            fontSize: 12,
            color: '#999',
            textAlign: 'center',
            marginTop: 8,
          }}
        >
          {inputMode === 'free'
            ? `장소·작성자·내용(${MIN_CONTENT}자 이상)을 입력하면 활성화됩니다.`
            : '장소·작성자·필수 3개 항목(어디서·무엇을·어떻게)을 입력하면 활성화됩니다.'}
        </div>
      )}
    </div>
  )
}
