import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { ChartCard } from '../../shared/ChartCard'
import { PaymentBadge } from '../../ui/badge'
import { NothingTransactionLottieIllustration } from '@/components/playful/NothingTransactionLottieIllustration'
import type { IAdminTransaction } from '../../../lib/types/transaction'
import { FormatRupiah, FormatPaymentDate } from '../../../lib/func/func'
import { Initials } from '../../../lib/func/func'
import { ROUTES } from '../../../lib/routes'

function TransactionRowSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-slate-200" />
          <div className="flex flex-col gap-1.5">
            <div className="h-3.5 w-24 rounded bg-slate-200" />
            <div className="h-3 w-16 rounded bg-slate-200" />
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5"><div className="h-3.5 w-32 rounded bg-slate-200" /></td>
      <td className="px-5 py-3.5"><div className="h-5 w-16 rounded-full bg-slate-200" /></td>
      <td className="px-5 py-3.5 text-right"><div className="ml-auto h-3.5 w-20 rounded bg-slate-200" /></td>
    </tr>
  )
}

interface RecentTransactionsProps {
  transactions?: IAdminTransaction[]
  isLoading?: boolean
  periodLabel?: string
}

export function RecentTransactions({
  transactions,
  isLoading,
  periodLabel,
}: RecentTransactionsProps) {
  const hasData = transactions && transactions.length > 0
  const subtitle = periodLabel
    ? `5 transaksi terakhir pada ${periodLabel}`
    : '5 transaksi terakhir di platform'

  return (
    <ChartCard
      title="Transaksi Terbaru"
      subtitle={subtitle}
      action={
        <Link
          to={ROUTES.admin.dashboard}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
        >
          Lihat semua
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      }
      contentClassName="px-0 py-0"
    >
      {isLoading ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-paper-paper text-xs font-semibold uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-5 py-3 text-left">Siswa</th>
                <th className="px-5 py-3 text-left">Kursus</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Array.from({ length: 5 }).map((_, i) => (
                <TransactionRowSkeleton key={i} />
              ))}
            </tbody>
          </table>
        </div>
      ) : !hasData ? (
        <div className="flex flex-col items-center px-6 py-10 text-center">
          <NothingTransactionLottieIllustration height="200px" className="mb-2" />
          <h3 className="text-sm font-semibold text-ink-900">Belum ada transaksi</h3>
          <p className="mt-1.5 max-w-sm text-xs font-medium leading-relaxed text-ink-500">
            Transaksi akan muncul di sini setelah siswa melakukan pembayaran.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-paper-paper text-xs font-semibold uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-5 py-3 text-left">Siswa</th>
                <th className="px-5 py-3 text-left">Kursus</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((t) => (
                <tr key={t.uid} className="transition-colors hover:bg-slate-50/60">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <StudentAvatar name={t.studentName} src={t.studentAvatar} />
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-800">{t.studentName}</span>
                        <span className="text-xs text-slate-400">{FormatPaymentDate(t.purchasedAt)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="max-w-[240px] px-5 py-3.5 text-slate-700">
                    <span className="line-clamp-1">{t.courseName}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <PaymentBadge status={t.paymentStatus} presentation="dot" />
                  </td>
                  <td className="px-5 py-3.5 text-right font-semibold tracking-tight text-slate-900 tabular-nums">
                    {t.price === 0 ? 'Gratis' : FormatRupiah(t.price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ChartCard>
  )
}

function StudentAvatar({ name, src }: { name: string; src?: string }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="h-8 w-8 rounded-full object-cover"
      />
    )
  }

  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
      {Initials(name)}
    </div>
  )
}
