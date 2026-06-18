import { format } from 'date-fns'
import { id } from 'date-fns/locale'

import { RollingNumber } from '@/components/ui/rolling-digit'
import { usePaymentDeadlineCountdown } from '@/hooks/use-payment-deadline-countdown'
import { cn } from '@/lib/utils'

type PaymentDeadlineCountdownProps = {
  expiredAt: string
  className?: string
}

function CountdownUnit({
  value,
  label,
  pad = 2,
}: {
  value: number
  label: string
  pad?: number
}) {
  return (
    <span className="inline-flex items-baseline gap-1">
      <span className="inline-flex min-w-[2ch] items-center justify-center  px-1.5 py-0.5 font-semibold tabular-nums text-slate-900">
        <RollingNumber value={value} pad={pad} />
      </span>
      <span className="text-slate-600">{label}</span>
    </span>
  )
}

export function PaymentDeadlineCountdown({ expiredAt, className }: PaymentDeadlineCountdownProps) {
  const { hours, minutes, seconds, isExpired } = usePaymentDeadlineCountdown(expiredAt)
  const absoluteDeadline = format(new Date(expiredAt), 'd MMMM yyyy, HH:mm', { locale: id })
  const hourPad = hours >= 100 ? 3 : 2

  if (isExpired) {
    return (
      <p className={cn('max-w-xl text-sm leading-6 text-slate-600 sm:text-base', className)}>
        Batas waktu pembayaran telah habis ({absoluteDeadline}).
      </p>
    )
  }

  return (
    <div className={cn('max-w-xl space-y-2', className)}>
      <p className="text-sm leading-7 text-slate-600 sm:text-base">
        <span>Selesaikan pembayaran sebelum </span>
        <span className="inline-flex flex-wrap items-baseline justify-center gap-x-2 gap-y-1 font-medium text-slate-800">
          <CountdownUnit value={hours} label="jam" pad={hourPad} />
          <CountdownUnit value={minutes} label="menit" />
          <CountdownUnit value={seconds} label="detik" />
        </span>
        <span className="text-slate-600">.</span>
      </p>
      <p className="text-xs font-medium text-slate-500 sm:text-sm">
        Batas akhir {absoluteDeadline}
      </p>
      <p className="sr-only" aria-live="polite">
        Sisa waktu pembayaran {hours} jam {minutes} menit {seconds} detik
      </p>
    </div>
  )
}
