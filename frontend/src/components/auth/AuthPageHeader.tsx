import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

type AuthPageHeaderProps = {
  title: string
  description?: string
  backHref?: string
  backLabel?: string
  action?: ReactNode
}

export function AuthPageHeader({
  title,
  description,
  backHref,
  backLabel = 'Kembali',
  action,
}: AuthPageHeaderProps) {
  return (
    <header className="space-y-3">
      {backHref ? (
        <Link
          to={backHref}
          className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          <ArrowLeft className="size-4" aria-hidden />
          {backLabel}
        </Link>
      ) : null}

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem]">
          {title}
        </h1>
        {description ? (
          <p className="max-w-[42ch] text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>

      {action}
    </header>
  )
}
