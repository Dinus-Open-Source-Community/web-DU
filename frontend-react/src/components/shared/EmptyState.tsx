import type { ReactNode } from 'react'
import { Inbox } from 'lucide-react'
import { cn } from '../../lib/utils'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-12 text-center', className)}>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">{icon ?? <Inbox className="h-5 w-5" aria-hidden />}</div>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
        {description && <p className="mx-auto max-w-sm text-xs leading-relaxed text-slate-500">{description}</p>}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}
