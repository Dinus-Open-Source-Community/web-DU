import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface ChartCardProps {
  title: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
}

export function ChartCard({ title, subtitle, action, children, className, contentClassName }: ChartCardProps) {
  return (
    <section className={cn('rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]', className)}>
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-base font-semibold tracking-tight text-slate-900">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
        {action && <div className="flex shrink-0 items-center">{action}</div>}
      </header>
      <div className={cn('px-5 py-5', contentClassName)}>{children}</div>
    </section>
  )
}
