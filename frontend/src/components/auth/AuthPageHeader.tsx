import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

import { cn } from '@/lib/utils'

type AuthPageHeaderProps = {
  title: string
  description?: string
  backHref?: string
  backLabel?: string
  action?: ReactNode
  /** Judul besar DynaPuff di tengah (login / register). */
  displayTitle?: boolean
}

export function AuthPageHeader({
  title,
  description,
  backHref,
  backLabel = 'Kembali',
  action,
  displayTitle = false,
}: AuthPageHeaderProps) {
  return (
    <header className={cn('space-y-3', displayTitle && 'text-center')}>
      {backHref ? (
        <Link
          to={backHref}
          className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
        >
          <ArrowLeft className="size-4" aria-hidden />
          {backLabel}
        </Link>
      ) : null}

      <div className={cn('space-y-2', displayTitle && 'space-y-0')}>
        <h1
          className={cn(
            displayTitle
              ? 'font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl'
              : 'text-2xl font-bold tracking-tight text-foreground sm:text-[1.75rem]',
          )}
        >
          {title}
        </h1>
        {description ? (
          <p
            className={cn(
              'max-w-[42ch] text-sm leading-6 text-muted-foreground',
              displayTitle && 'mx-auto',
            )}
          >
            {description}
          </p>
        ) : null}
      </div>

      {action}
    </header>
  )
}
