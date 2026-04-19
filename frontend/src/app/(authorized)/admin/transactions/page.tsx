import type { Metadata } from 'next'

import { AdminPageHeader } from '@/components/admin/AdminPageHeader'

import { TransactionsDashboard } from './_components/TransactionsDashboard'

export const metadata: Metadata = {
  title: 'Transaksi — Admin',
  robots: { index: false, follow: false },
}

export default function AdminTransactionsPage() {
  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Transaksi"
        subtitle="Pantau pendapatan, rasio status pembayaran, dan semua transaksi platform."
      />
      <TransactionsDashboard />
    </div>
  )
}
