import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface AdminPageHeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  className?: string
}

export function AdminPageHeader({ title, subtitle, actions, className }: AdminPageHeaderProps) {
  return (
    <header
      className={cn(
        'mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between',
        className
      )}>
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">{title}</h1>
        {subtitle && (
          <p className="max-w-2xl text-sm leading-6 text-slate-500 md:text-[15px]">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  )
}
