import type { ReactNode } from 'react'

type PaymentDetailFieldProps = {
  children?: ReactNode
  label: string
  value?: string
}

export function PaymentDetailField({
  children,
  label,
  value,
}: PaymentDetailFieldProps) {
  return (
    <div className="min-w-0 rounded-2xl bg-slate-50 px-4 py-3.5">
      <dt className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
        {label}
      </dt>
      <dd className="mt-1 min-w-0 text-sm font-semibold text-slate-900">
        {children ?? value}
      </dd>
    </div>
  )
}
