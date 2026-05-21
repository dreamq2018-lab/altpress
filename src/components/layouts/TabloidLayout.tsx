import type { CSSProperties } from 'react'
import type { ArticleData } from './types'
import {
  FONT_GOTHIC,
  FONT_MYEONGJO,
  PRINT_IMAGE_FILTER,
  formatDate,
  getTypeLabel,
} from './NewspaperBase'

interface TabloidLayoutProps {
  article: ArticleData
}

const NAVY = '#1B3A6B'

function formatIssueNumber(issueNumber?: string): string {
  if (!issueNumber) return ''
  // 숫자면 "제N호", 텍스트(예: "창간")면 "{text}호"
  return /^\d+$/.test(issueNumber) ? `제${issueNumber}호` : `${issueNumber}호`
}

const wrapperStyle: CSSProperties = {
  width: '279mm',
  minHeight: '432mm',
  background: '#ffffff',
  color: '#000',
  fontFamily: FONT_GOTHIC,
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
}

const mastheadStyle: CSSProperties = {
  background: NAVY,
  color: '#fff',
  padding: '10mm 12mm',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'baseline',
}

const mastTitleStyle: CSSProperties = {
  fontFamily: FONT_MYEONGJO,
  fontSize: '32px',
  fontWeight: 800,
  letterSpacing: '1px',
  lineHeight: 1.1,
  margin: 0,
}

const mastMetaStyle: CSSProperties = {
  fontSize: '12px',
  textAlign: 'right',
  lineHeight: 1.5,
}

const weatherStyle: CSSProperties = {
  marginTop: '2mm',
  fontSize: '11px',
  opacity: 0.9,
  letterSpacing: '0.3px',
}

const headlineSectionStyle: CSSProperties = {
  padding: '8mm 12mm 4mm',
  borderBottom: '4px solid #000',
}

const headlineStyle: CSSProperties = {
  fontFamily: FONT_MYEONGJO,
  fontSize: '42px',
  fontWeight: 800,
  lineHeight: 1.15,
  letterSpacing: '-1.5px',
  margin: 0,
}

const subtitleStyle: CSSProperties = {
  fontFamily: FONT_GOTHIC,
  fontSize: '16px',
  color: '#666',
  margin: '3mm 0 0',
  lineHeight: 1.4,
}

const contentRowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '60% 40%',
  gap: '8mm',
  padding: '6mm 12mm',
  flex: 1,
}

const mainPhotoStyle: CSSProperties = {
  width: '100%',
  display: 'block',
  filter: PRINT_IMAGE_FILTER,
  marginBottom: '4mm',
}

const photoCaptionStyle: CSSProperties = {
  fontFamily: FONT_GOTHIC,
  fontSize: '11px',
  fontStyle: 'italic',
  color: '#444',
  marginBottom: '4mm',
  marginTop: '-2mm',
}

const bodyStyle: CSSProperties = {
  fontFamily: FONT_GOTHIC,
  fontSize: '12px',
  lineHeight: 1.65,
  letterSpacing: '-0.2px',
  columnCount: 3,
  columnGap: '6mm',
  columnRule: '1px solid #ccc',
  textAlign: 'justify',
}

const sideColumnStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4mm',
}

const bylineBoxStyle: CSSProperties = {
  border: `2px solid ${NAVY}`,
  padding: '4mm',
  fontFamily: FONT_GOTHIC,
}

const bylineLabelStyle: CSSProperties = {
  fontSize: '10px',
  color: NAVY,
  fontWeight: 700,
  letterSpacing: '2px',
  marginBottom: '2mm',
}

const bylineNameStyle: CSSProperties = {
  fontFamily: FONT_MYEONGJO,
  fontSize: '16px',
  fontWeight: 700,
}

const bylineMetaStyle: CSSProperties = {
  fontSize: '11px',
  color: '#666',
  marginTop: '1.5mm',
}

const subPhotoStyle: CSSProperties = {
  width: '100%',
  display: 'block',
  filter: PRINT_IMAGE_FILTER,
}

const subPhotoPlaceholderStyle: CSSProperties = {
  width: '100%',
  aspectRatio: '4 / 3',
  background:
    'repeating-linear-gradient(45deg, #d4d4d4 0, #d4d4d4 1px, #f5f5f5 1px, #f5f5f5 8px)',
  border: '1px solid #bbb',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '2mm',
  fontFamily: FONT_GOTHIC,
  fontSize: '12px',
  color: '#666',
}

const photoPlaceholderIconStyle: CSSProperties = {
  fontSize: '28px',
  lineHeight: 1,
}

const adSectionStyle: CSSProperties = {
  margin: '6mm 12mm 4mm',
  border: '1.5px solid #000',
  padding: '4mm 6mm',
  fontFamily: FONT_GOTHIC,
  position: 'relative',
}

const adLabelStyle: CSSProperties = {
  position: 'absolute',
  top: '-3.5mm',
  left: '6mm',
  background: '#fff',
  padding: '0 2mm',
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '4px',
  color: '#000',
}

const adBodyStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '6mm',
}

const adHeadlineStyle: CSSProperties = {
  fontFamily: FONT_MYEONGJO,
  fontSize: '18px',
  fontWeight: 700,
  color: '#000',
}

const adContactStyle: CSSProperties = {
  fontSize: '11px',
  color: '#444',
  marginTop: '1mm',
}

const footerStyle: CSSProperties = {
  background: NAVY,
  color: '#fff',
  padding: '5mm 12mm',
  fontSize: '11px',
  display: 'flex',
  justifyContent: 'space-between',
}

export default function TabloidLayout({ article }: TabloidLayoutProps) {
  const {
    headline,
    subtitle,
    body,
    byline,
    date,
    location,
    authorName,
    mediaName,
    mediaNameHanja,
    issueNumber,
    photos = [],
    type,
  } = article

  const mainPhoto = photos[0]
  const subPhoto1 = photos[1]
  const subPhoto2 = photos[2]
  const typeLabel = getTypeLabel(type)

  return (
    <article className="tabloid-layout" style={wrapperStyle}>
      {/* Masthead */}
      <header style={mastheadStyle}>
        <h1 style={mastTitleStyle}>
          {mediaNameHanja ? `${mediaNameHanja}  ` : ''}
          {mediaName}
        </h1>
        <div style={mastMetaStyle}>
          <div>{formatDate(date)}</div>
          <div>{formatIssueNumber(issueNumber)}</div>
          <div style={weatherStyle}>맑음 ☀ 최고 24°C</div>
        </div>
      </header>

      {/* Headline */}
      <section style={headlineSectionStyle}>
        <h2 style={headlineStyle}>{headline}</h2>
        <p style={subtitleStyle}>▶ {subtitle}</p>
      </section>

      {/* Two-column content area */}
      <section style={contentRowStyle}>
        {/* Left: 60% */}
        <div>
          {mainPhoto ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={mainPhoto} alt="" style={mainPhotoStyle} />
              <p style={photoCaptionStyle}>
                {location}에서 {authorName}
              </p>
            </>
          ) : (
            <div style={{ ...subPhotoPlaceholderStyle, aspectRatio: '16 / 9', marginBottom: '4mm' }}>
              <span style={photoPlaceholderIconStyle}>📷</span>
              <span>사진을 추가하세요</span>
            </div>
          )}
          <div className="tabloid-body-text" style={bodyStyle}>
            {body}
          </div>
        </div>

        {/* Right: 40% */}
        <aside style={sideColumnStyle}>
          <div style={bylineBoxStyle}>
            <div style={bylineLabelStyle}>BYLINE</div>
            <div style={bylineNameStyle}>{byline}</div>
            <div style={bylineMetaStyle}>{typeLabel}</div>
            <div style={bylineMetaStyle}>{location}</div>
          </div>

          {subPhoto1 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={subPhoto1} alt="" style={subPhotoStyle} />
          ) : (
            <div style={subPhotoPlaceholderStyle}>
              <span style={photoPlaceholderIconStyle}>📷</span>
              <span>사진을 추가하세요</span>
            </div>
          )}

          {subPhoto2 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={subPhoto2} alt="" style={subPhotoStyle} />
          ) : (
            <div style={subPhotoPlaceholderStyle}>
              <span style={photoPlaceholderIconStyle}>📷</span>
              <span>사진을 추가하세요</span>
            </div>
          )}
        </aside>
      </section>

      {/* Ad section */}
      <section style={adSectionStyle}>
        <span style={adLabelStyle}>광고</span>
        <div style={adBodyStyle}>
          <div>
            <div style={adHeadlineStyle}>
              {mediaName}와 함께하는 지역 광고
            </div>
            <div style={adContactStyle}>
              지역 상권·문화 행사·캠페인 등 광고 게재 문의를 받습니다.
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: '#444' }}>문의</div>
            <div style={{ fontSize: '14px', fontWeight: 700 }}>
              editor@dasaneobo.kr
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={footerStyle}>
        <span>www.dasaneobo.kr</span>
        <span>발행: {mediaName} 언론협동조합</span>
      </footer>
    </article>
  )
}
