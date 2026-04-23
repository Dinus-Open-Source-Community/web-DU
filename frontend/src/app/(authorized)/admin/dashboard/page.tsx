import type { Metadata } from 'next'
import { SuspenseLoader } from '@/components/feedback/SuspenseLoader'

import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { KpiGrid } from './_components/KpiGrid'
import { RecentTransactions } from './_components/RecentTransactions'
import { UnresolvedTickets } from './_components/UnresolvedTickets'

export const metadata: Metadata = {
  title: 'Dashboard Admin',
  description: 'Ringkasan aktivitas platform.',
  robots: { index: false, follow: false },
}

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Welcome back, Admin"
        subtitle="Ringkasan performa platform, transaksi, dan aktivitas siswa terbaru."
      />

      <SuspenseLoader label="Memuat KPI">
        <KpiGrid />
      </SuspenseLoader>

      <SuspenseLoader label="Memuat tiket">
        <UnresolvedTickets />
      </SuspenseLoader>

      <SuspenseLoader label="Memuat transaksi terbaru">
        <RecentTransactions />
      </SuspenseLoader>
    </div>
  )
}
