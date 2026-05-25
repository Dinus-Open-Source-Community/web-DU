import { Link } from 'react-router-dom'
import { PaymentBadge } from '../ui/badge'
import { Button } from '../ui/button'
import { ReactIcon } from './icon'
import type { PaymentStatus } from '@/lib/types/transaction'

interface ItransactionCard {
  image?: string
  title: string
  classType?: string
  transactionId?: string
  paymentStatus?: PaymentStatus
  paymentMethod?: string
  purchasedAt?: string
  price?: string
  detailHref?: string
}

const TransactionsCard = ({ data }: { data: ItransactionCard }) => {
  return (
    <div className="flex w-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:flex-row">
      {/* Left — Image */}
      <div className="relative h-48 w-full shrink-0 sm:h-auto sm:w-52 md:w-60">
        {data.image ? (
          <img src={data.image} alt={data.title} className="object-cover" sizes="(max-width: 640px) 100vw, 240px" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-300">
            <ReactIcon />
          </div>
        )}
      </div>

      {/* Right — Content */}
      <div className="flex flex-1 flex-col justify-between p-5 md:p-6">
        {/* Top row: Badge + Status */}
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {data.classType && <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">{data.classType}</span>}
            {data.transactionId && <span className="text-xs font-medium text-slate-400">{data.transactionId}</span>}
          </div>
          {data.paymentStatus && <PaymentBadge status={data.paymentStatus} />}
        </div>

        {/* Title */}
        <h3 className="mb-1.5 line-clamp-2 text-base font-semibold leading-snug text-slate-900 md:text-lg">{data.title}</h3>

        {/* Meta info row */}
        <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-slate-500">
          {data.paymentMethod && (
            <span className="flex items-center gap-1">
              <span className="font-medium text-slate-400">Via</span> {data.paymentMethod}
            </span>
          )}
          {data.purchasedAt && <span>{data.purchasedAt}</span>}
        </div>

        {/* Bottom row: Price + Action */}
        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
          {data.price && <span className="text-lg font-bold tracking-tight text-slate-900">{data.price}</span>}
          {data.detailHref && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-8 rounded-lg border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 shadow-none hover:bg-slate-50 hover:text-slate-900">
              <Link to={data.detailHref}>Lihat Detail</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default TransactionsCard
