import { Check, Clock3, X } from 'lucide-react'

import type { PaymentStatus } from '@/lib/types/transaction'
import { cn } from '@/lib/utils'

const STEPS = ['Pesanan', 'Pembayaran', 'Konfirmasi'] as const

export function PaymentProgressNavigation({ status }: { status: PaymentStatus }) {
  const activeStep = status === 'pending' ? 1 : 2

  return (
    <nav aria-label="Tahapan pembayaran" className="mx-auto w-full max-w-2xl">
      <ol className="grid grid-cols-3">
        {STEPS.map((label, index) => {
          const isComplete = index < activeStep || status === 'success'
          const isFailed = status === 'failed' && index === 2
          const isActive = index === activeStep && status === 'pending'

          return (
            <li key={label} className="relative flex flex-col items-center gap-2 text-center">
              {index > 0 ? (
                <span
                  className={cn(
                    'absolute top-5 right-1/2 h-0.5 w-full -translate-y-1/2 transition-colors duration-300 motion-reduce:transition-none',
                    isComplete || isFailed ? 'bg-primary/45' : 'bg-slate-200',
                  )}
                  aria-hidden
                />
              ) : null}
              <span
                className={cn(
                  'relative z-10 flex size-10 items-center justify-center rounded-full border-4 border-white text-sm font-bold shadow-sm transition-all duration-300 motion-reduce:transition-none',
                  isFailed && 'bg-rose-600 text-white ring-4 ring-rose-100',
                  isComplete && !isFailed && 'bg-primary text-white ring-4 ring-primary/10',
                  isActive && 'bg-amber-500 text-white ring-4 ring-amber-100',
                  !isComplete && !isFailed && !isActive && 'bg-slate-100 text-slate-400',
                )}
              >
                {isFailed ? <X className="size-4" aria-hidden /> : null}
                {isComplete && !isFailed ? <Check className="size-4" aria-hidden /> : null}
                {isActive ? <Clock3 className="size-4" aria-hidden /> : null}
                {!isComplete && !isFailed && !isActive ? index + 1 : null}
              </span>
              <span
                className={cn(
                  'text-xs font-semibold sm:text-sm',
                  isFailed ? 'text-rose-700' : isComplete || isActive ? 'text-slate-900' : 'text-slate-400',
                )}
              >
                {label}
              </span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
