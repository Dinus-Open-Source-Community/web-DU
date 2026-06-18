import { useCallback, useEffect, useRef, useState } from 'react'

import { PaymentMotionLottie } from '@/components/student/transactions/payment-detail/PaymentMotionLottie'
import {
  getPaymentMotionDisplayMs,
  PAYMENT_LOTTIE_ASSETS,
  PAYMENT_MOTION_COPY,
  PAYMENT_MOTION_DURATION_MS,
  PAYMENT_MOTION_LOADER_COPY,
  PAYMENT_MOTION_THEME,
  type PaymentMotionOverlayMode,
  type PaymentMotionStatus,
} from '@/lib/transactions/payment-motion'
import { cn } from '@/lib/utils'

type PaymentMotionOverlayProps = {
  mode: PaymentMotionOverlayMode
  status: PaymentMotionStatus
  onDismiss: () => void
}

const motionEase = 'ease-in-out'
const motionDurationClass = 'duration-1000'

export function PaymentMotionPageLoader() {
  return <PaymentMotionOverlay mode="loading" status="pending" onDismiss={() => {}} />
}

export function PaymentMotionOverlay({ mode, status, onDismiss }: PaymentMotionOverlayProps) {
  const [phase, setPhase] = useState<'hold' | 'exit'>('hold')
  const phaseRef = useRef(phase)
  phaseRef.current = phase
  const isLoading = mode === 'loading'
  const theme = PAYMENT_MOTION_THEME[isLoading ? 'pending' : status]
  const copy = isLoading ? PAYMENT_MOTION_LOADER_COPY : PAYMENT_MOTION_COPY[status]
  const lottieSrc = isLoading ? PAYMENT_LOTTIE_ASSETS.pending : PAYMENT_LOTTIE_ASSETS[status]

  const beginExit = useCallback(() => {
    if (isLoading) return
    setPhase((current) => (current === 'exit' ? current : 'exit'))
  }, [isLoading])

  useEffect(() => {
    if (phaseRef.current === 'exit') return

    if (mode === 'loading') {
      setPhase('hold')
      return
    }

    setPhase('hold')

    const holdTimer = window.setTimeout(beginExit, getPaymentMotionDisplayMs(status))

    return () => window.clearTimeout(holdTimer)
  }, [beginExit, mode, status])

  useEffect(() => {
    if (phase !== 'exit') return
    const exitTimer = window.setTimeout(onDismiss, PAYMENT_MOTION_DURATION_MS)
    return () => window.clearTimeout(exitTimer)
  }, [onDismiss, phase])

  const isExiting = !isLoading && phase === 'exit'

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      onClick={isLoading ? undefined : beginExit}
      role="dialog"
      aria-modal="true"
      aria-label={copy.ariaLabel}
      aria-busy={isLoading}
    >
      <div
        className={cn(
          'absolute inset-0 translate-y-0 transform-gpu motion-reduce:transition-none',
          `transition-transform ${motionDurationClass} ${motionEase}`,
          theme.background,
          isExiting && '-translate-y-full',
        )}
        aria-hidden
      />

      <div
        className={cn(
          'relative flex h-full items-center justify-center p-6',
          'transform-gpu opacity-100 motion-reduce:transition-none',
          `transition-opacity ${motionDurationClass} ${motionEase}`,
          isExiting && 'opacity-0',
        )}
      >
        <div className="flex w-full max-w-lg flex-col items-center text-center">
          <div
            className={cn(
              'relative flex size-60 items-center justify-center sm:size-72',
              'rounded-[2rem] ring-1 motion-safe:animate-payment-float motion-reduce:animate-none',
              theme.ring,
              isExiting && 'motion-safe:animate-none',
            )}
          >
            <PaymentMotionLottie
              key={status}
              src={lottieSrc}
              className="relative size-full"
              loop={isLoading || status === 'pending'}
              autoplay
            />
          </div>

          <h2 className="mt-6 text-2xl font-bold tracking-tight text-white sm:text-[1.85rem]">
            {copy.title}
          </h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-white/90 sm:text-base">
            {copy.description}
          </p>
          {!isLoading && copy.hint ? (
            <span className="mt-6 text-xs font-semibold text-white/70">{copy.hint}</span>
          ) : null}
        </div>
      </div>
    </div>
  )
}
