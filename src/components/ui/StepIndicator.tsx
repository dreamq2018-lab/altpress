'use client'

import type { CSSProperties } from 'react'

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3
}

const STEPS = [
  { num: 1, label: '정보 입력' },
  { num: 2, label: '기사 생성' },
  { num: 3, label: '미리보기' },
] as const

const NAVY = '#1B3A6B'
const GRAY = '#bbb'

const wrapStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  gap: 0,
  margin: '24px auto 32px',
  maxWidth: 480,
}

const itemStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  flex: '0 0 auto',
  width: 88,
}

const lineStyle: CSSProperties = {
  flex: 1,
  height: 2,
  marginTop: 16,
  background: GRAY,
}

const lineActiveStyle: CSSProperties = {
  ...lineStyle,
  background: NAVY,
}

function dotStyle(active: boolean, completed: boolean): CSSProperties {
  return {
    width: 32,
    height: 32,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: 700,
    fontFamily: 'sans-serif',
    border: `2px solid ${active || completed ? NAVY : GRAY}`,
    background: active || completed ? NAVY : '#fff',
    color: active || completed ? '#fff' : GRAY,
    transition: 'all 0.2s',
  }
}

function labelStyle(active: boolean): CSSProperties {
  return {
    marginTop: 8,
    fontSize: 12,
    color: active ? NAVY : '#999',
    fontWeight: active ? 700 : 400,
    fontFamily: "'Nanum Gothic', sans-serif",
  }
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <nav aria-label="진행 단계" style={wrapStyle}>
      {STEPS.map((step, idx) => {
        const active = step.num === currentStep
        const completed = step.num < currentStep
        return (
          <div key={step.num} style={{ display: 'contents' }}>
            <div style={itemStyle}>
              <div style={dotStyle(active, completed)}>
                {completed ? '✓' : step.num}
              </div>
              <div style={labelStyle(active)}>{step.label}</div>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                style={
                  step.num < currentStep ? lineActiveStyle : lineStyle
                }
              />
            )}
          </div>
        )
      })}
    </nav>
  )
}
