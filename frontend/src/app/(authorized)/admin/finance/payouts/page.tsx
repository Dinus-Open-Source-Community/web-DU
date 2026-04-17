import type { Metadata } from 'next'

import { AdminPageHeader } from '@/components/admin/AdminPageHeader'

import { PayoutsTable } from './_components/PayoutsTable'

export const metadata: Metadata = {
  title: 'Payouts — Admin',
  robots: { index: false, follow: false },
}

export default function AdminPayoutsPage() {
  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Payouts"
        subtitle="Kelola permintaan pencairan dana dari mentor dan riwayat pembayaran."
      />
      <PayoutsTable />
    </div>
  )
}
