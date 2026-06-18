import type { LucideIcon } from 'lucide-react'
import { Check, Clock3, CreditCard, ShieldCheck, ShoppingBag, X } from 'lucide-react'

import type { PaymentStatus } from '@/lib/types/transaction'
import { cn } from '@/lib/utils'

type StepConfig = {
  label: string
  icon: LucideIcon
}

const STEPS: StepConfig[] = [
  { label: 'Pesanan', icon: ShoppingBag },
  { label: 'Pembayaran', icon: CreditCard },
  { label: 'Konfirmasi', icon: ShieldCheck },
]

type StepState = 'complete' | 'active' | 'failed' | 'upcoming'

function resolveStepState(
  index: number,
  activeStep: number,
  status: PaymentStatus,
): StepState {
  if (status === 'failed' && index === 2) return 'failed'
  if (index < activeStep || status === 'success') return 'complete'
  if (index === activeStep && status === 'pending') return 'active'
  return 'upcoming'
}

function StepIcon({ state, icon: Icon }: { state: StepState; icon: LucideIcon }) {
  if (state === 'failed') return <X className="size-[18px] stroke-[2.5px]" aria-hidden />
  if (state === 'complete') return <Check className="size-[18px] stroke-[2.5px]" aria-hidden />
  if (state === 'active') return <Clock3 className="size-[18px] stroke-[2.5px]" aria-hidden />
  return <Icon className="size-[18px] stroke-[2px]" aria-hidden />
}

const nodeStyles: Record<StepState, string> = {
  complete: 'bg-primary text-white shadow-[0_4px_14px_-4px_rgba(10,132,220,0.55)]',
  active: 'bg-sky-600 text-white shadow-[0_4px_14px_-4px_rgba(2,132,199,0.55)]',
  failed: 'bg-red-600 text-white shadow-[0_4px_14px_-4px_rgba(220,38,38,0.5)]',
  upcoming: 'bg-slate-50 text-slate-400 ring-1 ring-slate-200/90',
}

const labelStyles: Record<StepState, string> = {
  complete: 'text-slate-900',
  active: 'text-slate-900',
  failed: 'text-red-700',
  upcoming: 'text-slate-400',
}

export function PaymentProgressNavigation({ status }: { status: PaymentStatus }) {
  const activeStep = status === 'pending' ? 1 : 2

  return (
    <nav aria-label="Tahapan pembayaran" className="mx-auto w-full max-w-2xl px-1">
      <ol className="grid grid-cols-3 gap-2">
        {STEPS.map((step, index) => {
          const state = resolveStepState(index, activeStep, status)
          const connectorComplete =
            index > 0 &&
            (index <= activeStep || status === 'success' || (status === 'failed' && index <= 2))

          return (
            <li key={step.label} className="relative flex flex-col items-center gap-2.5 text-center">
              {index > 0 ? (
                <span
                  className={cn(
                    'absolute top-[22px] right-1/2 h-[2px] w-full -translate-y-1/2 rounded-full transition-colors duration-300 motion-reduce:transition-none',
                    connectorComplete ? 'bg-primary/50' : 'bg-slate-200',
                  )}
                  aria-hidden
                />
              ) : null}

              <span
                className={cn(
                  'relative z-10 flex size-11 items-center justify-center rounded-full transition-all duration-300 motion-reduce:transition-none',
                  state === 'complete' && status === 'success' && index === 2
                    ? 'bg-green-600 text-white shadow-[0_4px_14px_-4px_rgba(22,163,74,0.5)]'
                    : nodeStyles[state],
                )}
              >
                <StepIcon state={state} icon={step.icon} />
              </span>

              <span className={cn('text-xs font-semibold tracking-tight sm:text-sm', labelStyles[state])}>
                {step.label}
              </span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
