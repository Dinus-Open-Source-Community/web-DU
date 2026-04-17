import type { Metadata } from 'next'

import { AdminPageHeader } from '@/components/admin/AdminPageHeader'

import { AuditLogsTable } from './_components/AuditLogsTable'

export const metadata: Metadata = {
  title: 'Audit Logs — Admin',
  robots: { index: false, follow: false },
}

export default function AdminAuditLogsPage() {
  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Audit Logs"
        subtitle="Jejak seluruh aktivitas administrator dan perubahan data sensitif platform."
      />
      <AuditLogsTable />
    </div>
  )
}
