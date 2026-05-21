import type { CSSProperties } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import type { ArticleData } from './types'
import type { AdData } from '@/lib/ads'
import {
  FONT_GOTHIC,
  FONT_MYEONGJO,
  PRINT_IMAGE_FILTER,
  formatDate,
  getTypeLabel,
} from './NewspaperBase'

interface ThermalLayoutProps {
  article: ArticleData
  qrUrl?: string
  adData?: AdData | null
}

const wrapperStyle: CSSProperties = {
  width: '72mm',
  background: '#ffffff',
  color: '#000000',
  padding: '4mm 3mm',
  fontFamily: FONT_GOTHIC,
  boxSizing: 'border-box',
}

const hrThin: CSSProperties = {
  border: 'none',
  borderTop: '0.5px solid #000',
  margin: '1.5mm 0',
}

// 굵은 이중선 — 2px (위) + 3px 간격 + 0.5px (아래)
const doubleRuleStyle: CSSProperties = {
  height: '3px',
  borderTop: '2px solid #000',
  borderBottom: '0.5px solid #000',
  margin: '1.5mm 0',
}

const mastheadStyle: CSSProperties = {
  textAlign: 'center',
  fontFamily: FONT_MYEONGJO,
  padding: '8px 6px',
  background: '#1B3A6B',
  color: '#FFFFFF',
  WebkitPrintColorAdjust: 'exact',
  printColorAdjust: 'exact',
}

const mastTitleStyle: CSSProperties = {
  fontWeight: 800,
  letterSpacing: '0.5px',
  lineHeight: 1.1,
  margin: 0,
  color: '#FFFFFF',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

// 글자 수·가중치 기반으로 한 줄에 들어가는 폰트 크기를 결정.
// CJK 1.0 / 공백 0.4 / 라틴·숫자·기호 0.55 가중치.
function fitFontSize(
  text: string,
  base: number,
  availablePx: number,
  min: number,
): number {
  if (!text) return base
  const visual = Array.from(text).reduce((sum, ch) => {
    if (/\s/.test(ch)) return sum + 0.4
    if (/[一-鿿가-힯぀-ヿ]/.test(ch)) return sum + 1.0
    return sum + 0.55
  }, 0)
  if (visual === 0) return base
  const computed = Math.floor((availablePx / visual) * 0.95)
  return Math.max(min, Math.min(base, computed))
}

// 마스트헤드 — 72mm에서 양옆 패딩 후 가용 ~240px
function computeMastFontSize(text: string): number {
  return fitFontSize(text, 26, 240, 12)
}

// 광고 박스 내부 — 추가로 광고 박스 패딩(좌우 2.5mm) 빼면 ~215px
function computeAdFontSize(text: string, base: number, min: number): number {
  return fitFontSize(text, base, 215, min)
}

const mastSubStyle: CSSProperties = {
  fontFamily: FONT_GOTHIC,
  fontSize: '8px',
  lineHeight: 1.4,
  marginTop: '1.5mm',
  color: 'rgba(255,255,255,0.92)',
}

const typeBadgeStyle: CSSProperties = {
  display: 'inline-block',
  fontFamily: FONT_GOTHIC,
  fontSize: '9px',
  fontWeight: 700,
  padding: '1mm 2mm',
  border: '1px solid #000',
  marginBottom: '2mm',
}

const headlineStyle: CSSProperties = {
  fontFamily: FONT_MYEONGJO,
  fontSize: '18px',
  fontWeight: 800,
  lineHeight: 1.2,
  margin: '1mm 0 6px',
  letterSpacing: '-0.5px',
  borderBottom: '2.5px solid #000',
  paddingBottom: '4px',
}

const subtitleStyle: CSSProperties = {
  fontFamily: FONT_GOTHIC,
  fontSize: '11px',
  fontStyle: 'italic',
  lineHeight: 1.35,
  margin: 0,
}

const mainPhotoWrapStyle: CSSProperties = {
  margin: '2mm 0 0.5mm',
}

const mainPhotoStyle: CSSProperties = {
  width: '100%',
  display: 'block',
  filter: PRINT_IMAGE_FILTER,
}

const photoCaptionStyle: CSSProperties = {
  fontFamily: FONT_GOTHIC,
  fontSize: '8px',
  textAlign: 'center',
  marginTop: '0.8mm',
  fontStyle: 'italic',
}

const bodyAreaStyle: CSSProperties = {
  borderTop: '0.5px solid #888',
  marginTop: '4px',
  padding: '6px',
  background: '#F5F5F5',
  WebkitPrintColorAdjust: 'exact',
  printColorAdjust: 'exact',
}

const bodyStyle: CSSProperties = {
  fontFamily: FONT_GOTHIC,
  fontSize: '8.5px',
  lineHeight: 1.45,
  letterSpacing: '-0.5px',
  wordSpacing: '-0.5px',
  columnCount: 2,
  columnGap: '6px',
  columnRule: '0.5px solid #000',
  textAlign: 'justify',
  margin: 0,
  color: '#000',
}

const bylineStyle: CSSProperties = {
  textAlign: 'right',
  fontFamily: FONT_GOTHIC,
  marginTop: '1.5mm',
}

const bylineNameStyle: CSSProperties = {
  fontSize: '10px',
  fontWeight: 700,
}

const bylineTypeStyle: CSSProperties = {
  fontSize: '8px',
  marginTop: '0.5mm',
}

const subPhotosGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '2mm',
  marginTop: '2mm',
}

const subPhotoStyle: CSSProperties = {
  width: '100%',
  display: 'block',
  filter: PRINT_IMAGE_FILTER,
}

const footerStyle: CSSProperties = {
  textAlign: 'center',
  fontFamily: FONT_GOTHIC,
  fontSize: '8px',
  marginTop: '1mm',
}

const adWrapStyle: CSSProperties = {
  marginTop: '2.5mm',
  border: '1px solid #000',
  padding: '2mm 2.5mm',
  fontFamily: FONT_GOTHIC,
  position: 'relative',
}

const adLabelStyle: CSSProperties = {
  position: 'absolute',
  top: '-2mm',
  left: '2mm',
  background: '#fff',
  padding: '0 1.5mm',
  fontSize: '7px',
  fontWeight: 700,
  letterSpacing: '2px',
}

const adAdvertiserStyle: CSSProperties = {
  fontFamily: FONT_MYEONGJO,
  fontWeight: 700,
  marginTop: '0.5mm',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

const adMessageStyle: CSSProperties = {
  fontWeight: 700,
  lineHeight: 1.35,
  marginTop: '1mm',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

const adSubMessageStyle: CSSProperties = {
  color: '#444',
  lineHeight: 1.4,
  marginTop: '0.8mm',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

const tearLineWrapStyle: CSSProperties = {
  marginTop: '3mm',
  borderTop: '1px dashed #000',
  paddingTop: '1.5mm',
  textAlign: 'center',
}

const tearLineTextStyle: CSSProperties = {
  fontFamily: FONT_GOTHIC,
  fontSize: '9px',
  color: '#000',
  letterSpacing: '0.5px',
}

export default function ThermalLayout({
  article,
  qrUrl,
  adData,
}: ThermalLayoutProps) {
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
  const subPhotos = photos.slice(1, 3)
  const typeLabel = getTypeLabel(type)

  return (
    <article className="thermal-layout" style={wrapperStyle}>
      {/* Masthead — navy 배경 + 흰 글씨 */}
      <header className="thermal-masthead" style={mastheadStyle}>
        <h1
          style={{
            ...mastTitleStyle,
            fontSize: `${computeMastFontSize(
              `${mediaNameHanja ? mediaNameHanja + ' ' : ''}${mediaName}`,
            )}px`,
          }}
        >
          {mediaNameHanja ? `${mediaNameHanja} ` : ''}
          {mediaName}
        </h1>
        <div style={mastSubStyle}>
          {formatDate(date)}
          {issueNumber ? ` · ${issueNumber}호` : ''}
        </div>
        <div style={mastSubStyle}>{location} 현지 취재</div>
      </header>

      {/* Type badge */}
      <div style={typeBadgeStyle}>▶ {typeLabel}</div>

      {/* Headline — 아래 굵은 검정 선 (border-bottom) */}
      <h2 style={headlineStyle}>{headline}</h2>

      {/* Subtitle */}
      <p style={subtitleStyle}>{subtitle}</p>

      {/* Body area — 회색 배경 + 얇은 회색 상단 선 */}
      <div className="thermal-body-area" style={bodyAreaStyle}>
        {mainPhoto && (
          <figure style={mainPhotoWrapStyle}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={mainPhoto} alt="" style={mainPhotoStyle} />
            <figcaption style={photoCaptionStyle}>
              {location}에서 {authorName}
            </figcaption>
          </figure>
        )}

        {/* Body — 2-column */}
        <div style={bodyStyle}>{body}</div>
      </div>

      {/* Byline */}
      <hr style={hrThin} />
      <div style={bylineStyle}>
        <div style={bylineNameStyle}>{byline}</div>
        <div style={bylineTypeStyle}>{typeLabel}</div>
      </div>

      {/* Sub photos */}
      {subPhotos.length > 0 && (
        <div style={subPhotosGridStyle}>
          {subPhotos.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={src} alt="" style={subPhotoStyle} />
          ))}
        </div>
      )}

      {/* Footer — QR이 있을 때만 표시 */}
      {qrUrl && (
        <>
          <div style={doubleRuleStyle} />
          <footer style={footerStyle}>
            <div
              style={{
                marginTop: '1.5mm',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <QRCodeSVG
                value={qrUrl}
                size={80}
                level="M"
                includeMargin={false}
              />
            </div>
          </footer>
        </>
      )}

      {/* Ad section — 각 줄 자동 축소 */}
      {adData && (
        <div style={adWrapStyle}>
          <span style={adLabelStyle}>광고</span>
          <div
            style={{
              ...adAdvertiserStyle,
              fontSize: `${computeAdFontSize(adData.advertiser, 10, 8)}px`,
            }}
          >
            {adData.advertiser}
          </div>
          <div
            style={{
              ...adMessageStyle,
              fontSize: `${computeAdFontSize(adData.message, 11, 8)}px`,
            }}
          >
            {adData.message}
          </div>
          {adData.sub_message && (
            <div
              style={{
                ...adSubMessageStyle,
                fontSize: `${computeAdFontSize(adData.sub_message, 9, 7)}px`,
              }}
            >
              {adData.sub_message}
            </div>
          )}
        </div>
      )}

      {/* Fold guide — print only */}
      <hr className="thermal-fold-guide" style={{ display: 'none' }} />

      {/* Tear line */}
      <div style={tearLineWrapStyle}>
        <span style={tearLineTextStyle}>✂ 여기서 잘라주세요</span>
      </div>
    </article>
  )
}
