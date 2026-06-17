import { Check, Copy } from 'lucide-react'

import type { CopyablePaymentProps } from '@/lib/transactions/payment-detail-types'

type CopyPaymentValueButtonProps = CopyablePaymentProps & {
  copyKey: string
  label: string
  value: string
}

export function CopyPaymentValueButton({
  copiedKey,
  copyKey,
  label,
  onCopy,
  value,
}: CopyPaymentValueButtonProps) {
  const isCopied = copiedKey === copyKey

  return (
    <button
      type="button"
      onClick={() => onCopy(copyKey, value)}
      className="inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/30 hover:text-primary hover:shadow-md focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/20 active:translate-y-0 motion-reduce:transform-none motion-reduce:transition-none"
      aria-label={isCopied ? `${label} tersalin` : `Salin ${label}`}
    >
      {isCopied ? (
        <Check className="size-4 text-emerald-600" aria-hidden />
      ) : (
        <Copy className="size-4" aria-hidden />
      )}
    </button>
  )
}
