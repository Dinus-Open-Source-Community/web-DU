import type { LucideIcon } from 'lucide-react'
import { CircleCheck, CircleX, Clock3 } from 'lucide-react'

import type { PaymentInvoiceViewModel } from '@/lib/transactions/present-payment-invoice-view'
import type { PaymentStatus } from '@/lib/types/transaction'
import { PaymentDeadlineCountdown } from '@/components/student/transactions/payment-detail/PaymentDeadlineCountdown'
import { cn } from '@/lib/utils'

type PaymentStatusHeroProps = {
  invoice: PaymentInvoiceViewModel
}

const HERO_SURFACE: Record<PaymentStatus, string> = {
  pending: 'border-sky-200 bg-white',
  success: 'border-green-200 bg-white',
  failed: 'border-red-200 bg-white',
}

const HERO_ICON: Record<PaymentStatus, LucideIcon> = {
  pending: Clock3,
  success: CircleCheck,
  failed: CircleX,
}

const HERO_ICON_SURFACE: Record<PaymentStatus, string> = {
  pending: 'bg-sky-50 text-sky-600',
  success: 'bg-green-50 text-green-600',
  failed: 'bg-red-50 text-red-600',
}

export function PaymentStatusHero({ invoice }: PaymentStatusHeroProps) {
  const status = invoice.paymentStatus
  const StatusIcon = HERO_ICON[status]

  return (
    <section
      className={cn(
        'rounded-[28px] border px-5 py-8 text-center shadow-sm sm:px-8 sm:py-10',
        HERO_SURFACE[status],
      )}
      aria-live="polite"
    >
      <div className="mx-auto flex max-w-2xl flex-col items-center">
        <div
          className={cn(
            'flex size-24 items-center justify-center rounded-full sm:size-28',
            'animate-in zoom-in-90 fade-in duration-700 ease-out motion-reduce:animate-none',
            HERO_ICON_SURFACE[status],
          )}
        >
          <StatusIcon className="size-12 sm:size-14" aria-hidden />
        </div>

        <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          {status === 'success'
            ? 'Pembayaran berhasil'
            : status === 'failed'
              ? 'Pembayaran belum berhasil'
              : 'Selesaikan pembayaran Anda'}
        </h1>
        {status === 'pending' && invoice.expiredAt ? (
          <PaymentDeadlineCountdown className="mt-2" expiredAt={invoice.expiredAt} />
        ) : (
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
            {invoice.statusMessage}
          </p>
        )}
        <p className="mt-4 font-mono text-xs font-semibold tracking-wide text-slate-500">
          Ref. {invoice.reference}
        </p>
      </div>
    </section>
  )
}
