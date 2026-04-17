import type { Metadata } from 'next'

import { AdminPageHeader } from '@/components/admin/AdminPageHeader'

import { PendingApprovalsList } from './_components/PendingApprovalsList'

export const metadata: Metadata = {
  title: 'Persetujuan Kursus — Admin',
  robots: { index: false, follow: false },
}

export default function AdminPendingApprovalsPage() {
  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Persetujuan Kursus"
        subtitle="Tinjau pengajuan kursus baru dari mentor sebelum dipublikasikan ke siswa."
      />
      <PendingApprovalsList />
    </div>
  )
}
