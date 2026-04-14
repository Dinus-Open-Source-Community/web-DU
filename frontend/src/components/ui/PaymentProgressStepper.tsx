'use client'

import { useEffect, useState } from 'react'
import { Check, X, RefreshCw, Loader2, Unlock } from 'lucide-react'
import { PaymentStatus } from '@/lib/types'
import { getPaymentStepsConfig, getPaymentActiveStep, formatPaymentDate } from '@/lib/func'

interface PaymentProgressStepperProps {
  status: PaymentStatus
  purchasedAt: string
}

export function PaymentProgressStepper({ status, purchasedAt }: PaymentProgressStepperProps) {
  const [animatedStep, setAnimatedStep] = useState(0)
  const [progressWidth, setProgressWidth] = useState(0)

  const formattedDate = formatPaymentDate(purchasedAt)
  const steps = getPaymentStepsConfig(status, formattedDate)
  const activeStep = getPaymentActiveStep(status)

  // Animate steps appearing one by one
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedStep(activeStep)
      setProgressWidth(((activeStep - 1) / (steps.length - 1)) * 100)
    }, 300)
    return () => clearTimeout(timer)
  }, [activeStep, steps.length])

  const getStepIcon = (index: number) => {
    const stepNumber = index + 1
    const isCompleted = stepNumber <= animatedStep
    const isCurrent = stepNumber === animatedStep

    // FAILED state — last two steps are failures
    if (status === 'FAILED' && stepNumber >= 2 && isCompleted) {
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-rose-300 bg-rose-50 text-rose-500 transition-all duration-500">
          <X className="h-5 w-5" strokeWidth={2.5} />
        </div>
      )
    }

    // PENDING — current step shows loader
    if (status === 'PENDING' && isCurrent) {
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-primary transition-all duration-500">
          <RefreshCw className="h-4.5 w-4.5 animate-spin" strokeWidth={2.5} />
        </div>
      )
    }

    // Completed step
    if (isCompleted) {
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-emerald-400 bg-emerald-50 text-emerald-600 transition-all duration-500">
          <Check className="h-5 w-5" strokeWidth={2.5} />
        </div>
      )
    }

    // Future/inactive step
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-200 bg-slate-50 text-slate-300 transition-all duration-500">
        {stepNumber === 3 ? <Unlock className="h-4.5 w-4.5" strokeWidth={2} /> : <Loader2 className="h-4.5 w-4.5" strokeWidth={2} />}
      </div>
    )
  }

  // Progress line color
  const lineColor = status === 'FAILED' ? 'bg-rose-400' : status === 'PAID' ? 'bg-emerald-400' : 'bg-primary'
  const lineBg = 'bg-slate-200'

  return (
    <div className="w-full">
      {/* Stepper */}
      <div className="relative flex items-start justify-between">
        {/* Background line */}
        <div className={`absolute top-5 left-5 right-5 h-0.5 ${lineBg}`} />

        {/* Animated progress line */}
        <div className={`absolute top-5 left-5 h-0.5 ${lineColor} transition-all duration-1000 ease-out`} style={{ width: `calc(${progressWidth}% - 40px)` }} />

        {/* Steps */}
        {steps.map((step, index) => (
          <div key={index} className="relative z-10 flex flex-col items-center" style={{ width: `${100 / steps.length}%` }}>
            {getStepIcon(index)}
            <span className="mt-2.5 text-center text-xs font-semibold text-slate-700">{step.label}</span>
            <span className="mt-0.5 text-center text-[11px] font-medium text-slate-400">{step.subtitle}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Result Banner
interface PaymentResultBannerProps {
  status: PaymentStatus
}

export function PaymentResultBanner({ status }: PaymentResultBannerProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 800)
    return () => clearTimeout(timer)
  }, [])

  if (status === 'PENDING') return null

  const isPaid = status === 'PAID'

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border px-6 py-8 text-center transition-all duration-700 ${visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'} ${
        isPaid ? 'border-emerald-200/60 bg-emerald-50/40' : 'border-rose-200/60 bg-rose-50/40'
      }`}>
      {/* Icon */}
      <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full ${isPaid ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-500'}`}>
        {isPaid ? <Check className="h-7 w-7" strokeWidth={2.5} /> : <X className="h-7 w-7" strokeWidth={2.5} />}
      </div>

      <h3 className="text-lg font-bold text-slate-900">{isPaid ? 'Pembayaran Berhasil' : 'Pembayaran Gagal'}</h3>
      <p className="mt-1.5 max-w-sm text-sm font-medium leading-relaxed text-slate-500">
        {isPaid ? 'Terima kasih atas investasimu. Akses ke semua materi kelas telah dibuka secara otomatis.' : 'Pembayaran tidak dapat diproses. Silakan coba lagi atau hubungi tim support kami.'}
      </p>
    </div>
  )
}
