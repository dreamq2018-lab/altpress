'use client'

import { useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import ArticleForm, {
  type ArticleFormValue,
  type LayoutChoice,
} from '@/components/forms/ArticleForm'
import LoadingAnimation from '@/components/ui/LoadingAnimation'
import QRDisplay from '@/components/ui/QRDisplay'
import StepIndicator from '@/components/ui/StepIndicator'
import {
  type ArticleData,
  TabloidLayout,
  ThermalLayout,
} from '@/components/layouts'
import { type AdData, getAdByLocation } from '@/lib/ads'

type Step = 1 | 2 | 3

const NAVY = '#1B3A6B'

const pageStyle: CSSProperties = {
  minHeight: '100vh',
  background: '#f5f5f5',
  fontFamily: "'Nanum Gothic', sans-serif",
  paddingBottom: 40,
}

const headerStyle: CSSProperties = {
  background: '#fff',
  borderBottom: '1px solid #e5e5e5',
  padding: '20px 16px 0',
}

const brandStyle: CSSProperties = {
  fontFamily: "'Nanum Myeongjo', serif",
  fontSize: 28,
  fontWeight: 800,
  color: NAVY,
  textAlign: 'center',
  letterSpacing: 2,
}

const tagStyle: CSSProperties = {
  fontSize: 12,
  color: '#888',
  textAlign: 'center',
  marginTop: 4,
}

const errorBoxStyle: CSSProperties = {
  maxWidth: 720,
  margin: '16px auto 0',
  padding: '12px 16px',
  border: '1.5px solid #d33',
  background: '#fff4f4',
  color: '#a00',
  borderRadius: 6,
  fontSize: 13,
}

const previewWrapStyle: CSSProperties = {
  maxWidth: 1100,
  margin: '0 auto',
  padding: '0 16px',
}

const toolbarStyle: CSSProperties = {
  display: 'flex',
  gap: 8,
  justifyContent: 'center',
  flexWrap: 'wrap',
  marginBottom: 24,
}

function toolbarBtnStyle(variant: 'primary' | 'secondary'): CSSProperties {
  return {
    padding: '10px 18px',
    background: variant === 'primary' ? NAVY : '#fff',
    color: variant === 'primary' ? '#fff' : NAVY,
    border: `1.5px solid ${NAVY}`,
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: "'Nanum Gothic', sans-serif",
  }
}

const printAreaWrapStyle: CSSProperties = {
  background: '#fff',
  padding: 24,
  display: 'flex',
  justifyContent: 'center',
  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  borderRadius: 8,
}

function toDateStamp(date: string): string {
  return date.replace(/-/g, '')
}

type PrintJobState =
  | { status: 'idle' }
  | { status: 'saving' }
  | { status: 'done'; printUrl: string }
  | { status: 'error'; message: string }

export default function Home() {
  const [step, setStep] = useState<Step>(1)
  const [layoutChoice, setLayoutChoice] = useState<LayoutChoice>('thermal')
  const [articleData, setArticleData] = useState<ArticleData | null>(null)
  const [adData, setAdData] = useState<AdData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastFormValue, setLastFormValue] = useState<ArticleFormValue | null>(
    null,
  )
  const [printJob, setPrintJob] = useState<PrintJobState>({ status: 'idle' })
  const printAreaRef = useRef<HTMLDivElement>(null)

  const generateArticle = async (form: ArticleFormValue) => {
    setLastFormValue(form)
    setLayoutChoice(form.layout)
    setError(null)
    setStep(2)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: form.type,
          layout: form.layout,
          location: form.location,
          date: form.date,
          authorName: form.authorName,
          content: form.content,
          mediaName: form.mediaName,
          mediaNameHanja: form.mediaNameHanja,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `HTTP ${res.status}`)
      }

      const ai = (await res.json()) as {
        id: string
        headline: string
        subtitle: string
        body: string
        byline: string
      }

      setArticleData({
        type: form.type,
        headline: ai.headline,
        subtitle: ai.subtitle,
        body: ai.body,
        byline: ai.byline,
        date: form.date,
        location: form.location,
        authorName: form.authorName,
        mediaName: form.mediaName,
        mediaNameHanja: form.mediaNameHanja,
        issueNumber: '창간',
        photos: form.photos,
      })

      // 광고 조회 — 실패해도 기사 흐름은 진행
      try {
        const ad = await getAdByLocation(form.location)
        setAdData(ad)
      } catch {
        setAdData(null)
      }

      setStep(3)
    } catch (e) {
      const msg = e instanceof Error ? e.message : '알 수 없는 오류'
      setError(`기사 생성 실패: ${msg}`)
      setStep(1)
    }
  }

  const backToForm = () => {
    setStep(1)
    setError(null)
    setPrintJob({ status: 'idle' })
  }

  const requestPrint = async () => {
    if (!articleData) return
    setPrintJob({ status: 'saving' })
    try {
      const res = await fetch('/api/print/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleData,
          layoutType: layoutChoice,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`)
      }
      setPrintJob({ status: 'done', printUrl: data.printUrl as string })
    } catch (e) {
      const msg = e instanceof Error ? e.message : '알 수 없는 오류'
      setPrintJob({ status: 'error', message: msg })
    }
  }

  const handlePdfSave = async () => {
    if (!printAreaRef.current || !articleData) return
    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf'),
    ])

    const target = printAreaRef.current
    const canvas = await html2canvas(target, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
    })

    const isTabloid = layoutChoice === 'tabloid'
    const widthMm = isTabloid ? 279 : 80
    const heightMm = isTabloid
      ? 432
      : Math.round((canvas.height / canvas.width) * widthMm)

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [widthMm, heightMm],
      compress: true,
    })

    pdf.addImage(
      canvas.toDataURL('image/png'),
      'PNG',
      0,
      0,
      widthMm,
      heightMm,
      undefined,
      'FAST',
    )

    const dateStamp = toDateStamp(articleData.date)
    pdf.save(`${articleData.mediaName}_기사_${dateStamp}.pdf`)
  }

  return (
    <main style={pageStyle}>
      {step !== 2 && (
        <header className="no-print" style={headerStyle}>
          <div style={brandStyle}>茶山語報 다산어보</div>
          <div style={tagStyle}>AI 신문 체험 발행소</div>
          <StepIndicator currentStep={step} />
        </header>
      )}

      {error && step === 1 && <div style={errorBoxStyle}>⚠ {error}</div>}

      {step === 1 && (
        <ArticleForm
          key={lastFormValue ? 'retry' : 'fresh'}
          onSubmit={generateArticle}
        />
      )}

      {step === 2 && <LoadingAnimation />}

      {step === 3 && articleData && (
        <div style={previewWrapStyle}>
          {printJob.status === 'done' ? (
            <QRDisplay
              printUrl={printJob.printUrl}
              articleData={articleData}
              onReset={backToForm}
            />
          ) : (
            <>
              <div className="no-print" style={toolbarStyle}>
                <button
                  type="button"
                  style={toolbarBtnStyle('secondary')}
                  onClick={backToForm}
                >
                  ← 다시 작성
                </button>
                <button
                  type="button"
                  style={toolbarBtnStyle('primary')}
                  onClick={requestPrint}
                  disabled={printJob.status === 'saving'}
                >
                  {printJob.status === 'saving'
                    ? '인쇄 요청 중…'
                    : '🖨 인쇄 요청하기'}
                </button>
                <button
                  type="button"
                  style={toolbarBtnStyle('primary')}
                  onClick={handlePdfSave}
                >
                  📄 PDF 저장
                </button>
              </div>

              {printJob.status === 'error' && (
                <div style={errorBoxStyle}>
                  ⚠ 인쇄 요청 실패: {printJob.message}
                </div>
              )}

              <div id="print-area" ref={printAreaRef} style={printAreaWrapStyle}>
                {layoutChoice === 'thermal' ? (
                  <ThermalLayout article={articleData} adData={adData} />
                ) : (
                  <div
                    style={{
                      transform: 'scale(0.65)',
                      transformOrigin: 'top center',
                      width: '279mm',
                    }}
                  >
                    <TabloidLayout article={articleData} />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </main>
  )
}
