import type { ReactNode } from 'react'
import { Inbox } from 'lucide-react'
import { cn } from '../../lib/utils'

interface EmptyStateProps {
  icon?: ReactNode
  /** Tanpa lingkaran ikon generik (disarankan untuk dashboard admin). */
  hideIcon?: boolean
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  icon,
  hideIcon = false,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-ink-900/10 bg-paper-paper px-6 py-12 text-center',
        className,
      )}
    >
      {!hideIcon ? (
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-ink-900/10 bg-paper-white text-ink-400">
          {icon ?? <Inbox className="h-5 w-5" aria-hidden />}
        </div>
      ) : null}
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-ink-900">{title}</h3>
        {description ? (
          <p className="mx-auto max-w-sm text-xs leading-relaxed text-ink-500">{description}</p>
        ) : null}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}
