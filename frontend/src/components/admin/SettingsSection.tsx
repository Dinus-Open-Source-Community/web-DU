import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface SettingsSectionProps {
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  className?: string
}

export function SettingsSection({
  title,
  description,
  children,
  className,
}: SettingsSectionProps) {
  return (
    <section
      className={cn(
        'grid grid-cols-1 gap-5 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] md:grid-cols-[260px_1fr]',
        className
      )}>
      <div className="md:max-w-[240px]">
        <h2 className="text-sm font-semibold tracking-tight text-slate-900">{title}</h2>
        {description && <p className="mt-1 text-xs text-slate-500">{description}</p>}
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  )
}
