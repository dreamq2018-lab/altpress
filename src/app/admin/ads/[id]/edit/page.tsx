'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import AdForm from '@/components/admin/AdForm'
import AdminShell from '@/components/admin/AdminShell'
import { type AdData, type AdInput, getAd, updateAd } from '@/lib/ads'

export default function EditAdPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params.id

  const [ad, setAd] = useState<AdData | null | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getAd(id)
      .then(setAd)
      .catch((e) => setError(e instanceof Error ? e.message : '조회 실패'))
  }, [id])

  const handleSubmit = async (value: AdInput) => {
    await updateAd(id, value)
    router.push('/admin/ads')
  }

  return (
    <AdminShell
      title="광고 수정"
      breadcrumb={`대시보드 / 광고 관리 / 수정 #${id.slice(0, 8)}`}
    >
      {error && (
        <div
          style={{
            background: '#fff4f4',
            border: '1px solid #d33',
            padding: '12px 16px',
            borderRadius: 6,
            color: '#a00',
            fontSize: 13,
          }}
        >
          ⚠ {error}
        </div>
      )}
      {ad === undefined ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>
          불러오는 중…
        </div>
      ) : ad === null ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>
          광고를 찾을 수 없습니다.
        </div>
      ) : (
        <AdForm
          initial={{
            advertiser: ad.advertiser,
            message: ad.message,
            sub_message: ad.sub_message,
            locations: ad.locations,
            starts_at: ad.starts_at,
            ends_at: ad.ends_at,
          }}
          onSubmit={handleSubmit}
          submitLabel="수정하기"
        />
      )}
    </AdminShell>
  )
}
