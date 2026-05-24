import { Link } from 'react-router-dom'
import { ChartCard } from '../../shared/ChartCard'
import { PaymentBadge } from '../../ui/badge'
import type { TransactionHistoryItem } from '../../../lib/types/transaction'
import { FormatRupiah } from '../../../lib/func/func'

export function RecentTransactions({ transactions }: { transactions?: TransactionHistoryItem[] }) {
  return (
    <ChartCard
      title="Recent Transactions"
      subtitle="5 transaksi terakhir di platform."
      action={
        <Link to="/admin/finance/transactions" className="text-xs font-semibold text-primary hover:underline">
          Kelola transaksi
        </Link>
      }
      contentClassName="px-0 py-0">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-5 py-3 text-left">Transaksi</th>
              <th className="px-5 py-3 text-left">Kursus</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions?.map((t) => (
              <tr key={t.uid} className="transition-colors hover:bg-slate-50/60">
                <td className="px-5 py-3.5">
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-800">{t.transactionId}</span>
                    <span className="text-xs text-slate-400">{t.paymentMethod}</span>
                  </div>
                </td>
                <td className="max-w-[240px] px-5 py-3.5 text-slate-700">
                  <span className="line-clamp-1">{t.courseName}</span>
                </td>
                <td className="px-5 py-3.5">
                  <PaymentBadge status={t.paymentStatus} />
                </td>
                <td className="px-5 py-3.5 text-right font-semibold tracking-tight text-slate-900 tabular-nums">{t.price === 0 ? 'Gratis' : FormatRupiah(t.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ChartCard>
  )
}
