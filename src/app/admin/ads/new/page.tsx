'use client'

import { useRouter } from 'next/navigation'
import AdForm from '@/components/admin/AdForm'
import AdminShell from '@/components/admin/AdminShell'
import { insertAd, type AdInput } from '@/lib/ads'

export default function NewAdPage() {
  const router = useRouter()

  const handleSubmit = async (value: AdInput) => {
    await insertAd(value)
    router.push('/admin/ads')
  }

  return (
    <AdminShell title="새 광고 등록" breadcrumb="대시보드 / 광고 관리 / 새 광고">
      <AdForm onSubmit={handleSubmit} submitLabel="등록하기" />
    </AdminShell>
  )
}
