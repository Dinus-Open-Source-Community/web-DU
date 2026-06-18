import type { PaymentInvoiceViewModel } from '@/lib/transactions/present-payment-invoice-view'
import {
  PAYMENT_LOTTIE_ASSETS,
  type PaymentMotionStatus,
} from '@/lib/transactions/payment-motion'
import { PaymentDeadlineCountdown } from '@/components/student/transactions/payment-detail/PaymentDeadlineCountdown'
import { SafeLottie } from '@/components/ui/lottie'
import { cn } from '@/lib/utils'

type PaymentStatusHeroProps = {
  invoice: PaymentInvoiceViewModel
}

const HERO_SURFACE: Record<PaymentMotionStatus, string> = {
  pending: 'border-sky-200 bg-white',
  success: 'border-green-200 bg-white',
  failed: 'border-red-200 bg-white',
}

export function PaymentStatusHero({ invoice }: PaymentStatusHeroProps) {
  const motionStatus = invoice.paymentStatus as PaymentMotionStatus

  return (
    <section
      className={cn(
        'rounded-[28px] border px-5 py-8 text-center shadow-sm sm:px-8 sm:py-10',
        HERO_SURFACE[motionStatus],
      )}
      aria-live="polite"
    >
      <div className="mx-auto flex max-w-2xl flex-col items-center">
        <div
          className={cn(
            'flex size-24 items-center justify-center sm:size-28',
            'animate-in zoom-in-90 fade-in duration-700 ease-out motion-reduce:animate-none',
            '[&_canvas]:h-full [&_canvas]:w-full [&_svg]:h-full [&_svg]:w-full',
          )}
        >
          <SafeLottie
            src={PAYMENT_LOTTIE_ASSETS[motionStatus]}
            className="size-full"
            loop={motionStatus === 'pending'}
            autoplay
          />
        </div>

        <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          {motionStatus === 'success'
            ? 'Pembayaran berhasil'
            : motionStatus === 'failed'
              ? 'Pembayaran belum berhasil'
              : 'Selesaikan pembayaran Anda'}
        </h1>
        {motionStatus === 'pending' && invoice.expiredAt ? (
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
