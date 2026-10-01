import type { ReactNode } from 'react'

import { appCardClassName, appCardHeaderClassName } from '@/lib/design/app-shell-tokens'
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
    <section className={cn(appCardClassName, className)}>
      <header
        className={cn(
          'flex flex-wrap items-start justify-between gap-3 px-5 py-4',
          appCardHeaderClassName,
        )}
      >
        <div className="flex flex-col gap-0.5">
          <h3 className="text-base font-semibold tracking-tight text-ink-900">{title}</h3>
          {subtitle ? <p className="text-xs font-medium text-ink-500">{subtitle}</p> : null}
        </div>
        {action && <div className="flex shrink-0 items-center">{action}</div>}
      </header>
      <div className={cn('px-5 py-5', contentClassName)}>{children}</div>
    </section>
  )
}
