'use client'

import {
  ArticleData,
  TabloidLayout,
  ThermalLayout,
} from '@/components/layouts'

const dummyArticle: ArticleData = {
  headline: '다산초당에서 만난 200년 전 목민의 마음',
  subtitle: '정약용 선생의 유배지, 강진을 걷다',
  body: '전라남도 강진군 도암면 만덕리 산자락에 자리한 다산초당. 조선 후기 실학자 정약용 선생이 18년간 유배 생활을 하며 목민심서, 경세유표 등 주요 저작을 집필한 곳이다. 초당 앞 작은 연못 \'다산연지\'에는 아직도 연꽃이 피어나고, 선생이 직접 새겼다는 \'정석(丁石)\' 바위가 세월을 버티고 서 있다. 오솔길을 따라 걸어 오르면 사철 푸른 동백나무 군락이 방문객을 맞이한다. 5월의 강진은 신록이 가장 짙은 시기로, 햇살이 잎사귀 사이로 잘게 부서져 내린다. 초당 마루에 앉아 잠시 숨을 고르면, 200년 전 선생이 같은 자리에서 백성을 향한 글을 써내려갔을 모습이 그려진다. \'백성의 굶주림을 살피지 못하는 관리는 도적과 다름없다\' — 목민심서의 한 구절이 오늘도 묵직하게 가슴을 친다. 인근 백련사로 이어지는 산길은 약 1km 남짓. 선생이 친구 혜장스님을 만나러 오갔다는 그 길을 따라 걸으면 차밭 향기가 옅게 풍겨온다. 길 끝에 다다르면 강진만의 푸른 물결이 한눈에 펼쳐진다. 오늘도 이곳을 찾은 이들의 발걸음이 이어진다. 백성을 향한 선생의 마음이 200년이 지난 지금도 이 자리에 살아 숨쉬고 있었다.',
  byline: '이득규 특파원 현지 보고',
  date: '2026-05-21',
  location: '전남 강진 다산초당',
  authorName: '이득규',
  mediaName: '다산어보',
  mediaNameHanja: '茶山語報',
  issueNumber: '창간',
  type: 'travel',
  photos: [],
}

export default function TestPage() {
  return (
    <main
      style={{
        background: '#f5f5f5',
        minHeight: '100vh',
        padding: '24px',
        fontFamily: "'Nanum Gothic', sans-serif",
      }}
    >
      <div
        className="no-print"
        style={{
          maxWidth: 1100,
          margin: '0 auto 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>
          신문 레이아웃 미리보기 (altpress)
        </h1>
        <button
          type="button"
          onClick={() => window.print()}
          style={{
            background: '#1B3A6B',
            color: '#fff',
            border: 'none',
            padding: '10px 16px',
            fontSize: 14,
            cursor: 'pointer',
            borderRadius: 4,
          }}
        >
          🖨 인쇄 테스트
        </button>
      </div>

      {/* Thermal preview */}
      <section style={{ maxWidth: 1100, margin: '0 auto 40px' }}>
        <h2
          className="no-print"
          style={{
            fontSize: 16,
            fontWeight: 700,
            marginBottom: 12,
            color: '#333',
          }}
        >
          1. ThermalLayout · 80mm 감열 두루마리 (실제 너비 72mm)
        </h2>
        <div
          style={{
            display: 'inline-block',
            border: '1px dashed #999',
            background: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,.1)',
          }}
        >
          <ThermalLayout article={dummyArticle} />
        </div>
      </section>

      <hr
        className="no-print"
        style={{
          maxWidth: 1100,
          margin: '40px auto',
          border: 'none',
          borderTop: '2px solid #ccc',
        }}
      />

      {/* Tabloid preview */}
      <section style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h2
          className="no-print"
          style={{
            fontSize: 16,
            fontWeight: 700,
            marginBottom: 12,
            color: '#333',
          }}
        >
          2. TabloidLayout · 279 × 432mm (축소 표시)
        </h2>
        <div
          style={{
            transform: 'scale(0.55)',
            transformOrigin: 'top left',
            width: '279mm',
            border: '1px dashed #999',
            boxShadow: '0 2px 8px rgba(0,0,0,.1)',
          }}
        >
          <TabloidLayout article={dummyArticle} />
        </div>
      </section>
    </main>
  )
}
