import React from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import TransactionsList from './TransactionsTable'

const Section = () => {
  return (
    <section className="w-full px-5 py-8 md:px-8 md:py-10">
      <PageHeader
        title="Riwayat Transaksi"
        subtitle="Lihat status pembayaran dan akses detail invoice dari seluruh pembelian kelas Anda."
      />

      <TransactionsList />
    </section>
  )
}

export default Section
