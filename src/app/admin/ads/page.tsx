'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import AdminShell from '@/components/admin/AdminShell'
import {
  type AdData,
  deleteAd,
  listAds,
  toggleAdActive,
} from '@/lib/ads'
import { adminUrl } from '@/lib/locations'

const NAVY = '#1B3A6B'

const topBarStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  marginBottom: 16,
}

const primaryBtnStyle: CSSProperties = {
  background: NAVY,
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  padding: '10px 18px',
  fontSize: 14,
  fontWeight: 700,
  cursor: 'pointer',
  textDecoration: 'none',
  display: 'inline-block',
}

const tableWrapStyle: CSSProperties = {
  background: '#fff',
  borderRadius: 10,
  overflow: 'auto',
  border: '1px solid #e5e5e5',
}

const tableStyle: CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 14,
}

const thStyle: CSSProperties = {
  background: '#f7f7f7',
  textAlign: 'left',
  padding: '12px 14px',
  fontSize: 12,
  fontWeight: 700,
  color: '#555',
  borderBottom: '1px solid #e5e5e5',
  whiteSpace: 'nowrap',
}

const tdStyle: CSSProperties = {
  padding: '14px',
  borderBottom: '1px solid #f0f0f0',
  verticalAlign: 'top',
  color: '#222',
}

const badgeStyle = (active: boolean): CSSProperties => ({
  display: 'inline-block',
  padding: '3px 10px',
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
  background: active ? '#e6f4ea' : '#f0f0f0',
  color: active ? '#0a8043' : '#666',
})

const actionBtnStyle: CSSProperties = {
  background: '#fff',
  border: `1px solid ${NAVY}`,
  color: NAVY,
  borderRadius: 4,
  padding: '4px 10px',
  fontSize: 12,
  cursor: 'pointer',
  marginRight: 4,
  fontFamily: 'inherit',
  textDecoration: 'none',
  display: 'inline-block',
}

const dangerBtnStyle: CSSProperties = {
  ...actionBtnStyle,
  border: '1px solid #d33',
  color: '#d33',
}

const toggleBtnStyle = (active: boolean): CSSProperties => ({
  ...actionBtnStyle,
  border: '1px solid #999',
  color: active ? '#a00' : '#0a8043',
})

const emptyStyle: CSSProperties = {
  padding: '60px 20px',
  textAlign: 'center',
  color: '#888',
  fontSize: 14,
}

function formatRange(starts?: string, ends?: string): string {
  if (!starts && !ends) return '기간 제한 없음'
  return `${starts ?? '시작 없음'} ~ ${ends ?? '종료 없음'}`
}

export default function AdsListPage() {
  const [ads, setAds] = useState<AdData[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      const data = await listAds()
      setAds(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : '광고 조회 실패')
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const onToggle = async (ad: AdData) => {
    setPending(ad.id)
    try {
      await toggleAdActive(ad.id, !ad.active)
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ON/OFF 실패')
    } finally {
      setPending(null)
    }
  }

  const onDelete = async (ad: AdData) => {
    if (!window.confirm(`광고 '${ad.advertiser}'을(를) 삭제하시겠습니까?`)) return
    setPending(ad.id)
    try {
      await deleteAd(ad.id)
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : '삭제 실패')
    } finally {
      setPending(null)
    }
  }

  return (
    <AdminShell title="광고 관리" breadcrumb="대시보드 / 광고 관리">
      {error && (
        <div
          style={{
            background: '#fff4f4',
            border: '1px solid #d33',
            padding: '12px 16px',
            borderRadius: 6,
            color: '#a00',
            marginBottom: 16,
            fontSize: 13,
          }}
        >
          ⚠ {error}
        </div>
      )}

      <div style={topBarStyle}>
        <Link href={adminUrl('/admin/ads/new')} style={primaryBtnStyle}>
          + 새 광고 등록
        </Link>
      </div>

      <div style={tableWrapStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>광고주</th>
              <th style={thStyle}>문구</th>
              <th style={thStyle}>적용 지역</th>
              <th style={thStyle}>게재 기간</th>
              <th style={thStyle}>상태</th>
              <th style={thStyle}>관리</th>
            </tr>
          </thead>
          <tbody>
            {ads === null ? (
              <tr>
                <td colSpan={6} style={emptyStyle}>
                  불러오는 중…
                </td>
              </tr>
            ) : ads.length === 0 ? (
              <tr>
                <td colSpan={6} style={emptyStyle}>
                  등록된 광고가 없습니다.
                </td>
              </tr>
            ) : (
              ads.map((ad) => (
                <tr key={ad.id}>
                  <td style={tdStyle}>{ad.advertiser}</td>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 700 }}>{ad.message}</div>
                    {ad.sub_message && (
                      <div style={{ color: '#666', fontSize: 12, marginTop: 2 }}>
                        {ad.sub_message}
                      </div>
                    )}
                  </td>
                  <td style={{ ...tdStyle, fontSize: 12 }}>
                    {ad.locations.join(', ')}
                  </td>
                  <td style={{ ...tdStyle, fontSize: 12, whiteSpace: 'nowrap' }}>
                    {formatRange(ad.starts_at, ad.ends_at)}
                  </td>
                  <td style={tdStyle}>
                    <span style={badgeStyle(ad.active)}>
                      {ad.active ? '🟢 활성' : '⚪ 비활성'}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                    <Link
                      href={adminUrl(`/admin/ads/${ad.id}/edit`)}
                      style={actionBtnStyle}
                    >
                      수정
                    </Link>
                    <button
                      type="button"
                      style={toggleBtnStyle(ad.active)}
                      onClick={() => onToggle(ad)}
                      disabled={pending === ad.id}
                    >
                      {ad.active ? 'OFF' : 'ON'}
                    </button>
                    <button
                      type="button"
                      style={dangerBtnStyle}
                      onClick={() => onDelete(ad)}
                      disabled={pending === ad.id}
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  )
}
