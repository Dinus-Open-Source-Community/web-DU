import { Banknote } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'

export default function MentorEarningsPage() {
  return (
    <section className="flex w-full flex-col gap-8">
      <PageHeader title="Earnings" subtitle="Kelola pendapatan dan riwayat pembayaran Anda." />

      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200/90 bg-white px-6 py-20 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <Banknote className="size-8" />
        </div>
        <h3 className="mt-5 text-lg font-semibold text-slate-900">Segera hadir</h3>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
          Fitur earnings sedang dalam pengembangan. Anda akan bisa melihat rincian pendapatan, penarikan, dan riwayat transaksi di sini.
        </p>
      </div>
    </section>
  )
}
