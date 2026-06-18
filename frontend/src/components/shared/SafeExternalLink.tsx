import type { AnchorHTMLAttributes, ReactNode } from 'react'

import { resolveSafeExternalHref } from '@/lib/security/safe-external-url'
import { cn } from '@/lib/utils'

type SafeExternalLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  href: string
  children: ReactNode
  fallback?: ReactNode
}

export function SafeExternalLink({
  href,
  children,
  className,
  fallback = null,
  target = '_blank',
  rel = 'noopener noreferrer',
  ...props
}: SafeExternalLinkProps) {
  const safeHref = resolveSafeExternalHref(href)

  if (!safeHref) {
    return fallback
  }

  const isExternal = /^https?:\/\//i.test(safeHref)

  return (
    <a
      href={safeHref}
      className={cn(className)}
      target={isExternal ? target : undefined}
      rel={isExternal ? rel : undefined}
      {...props}
    >
      {children}
    </a>
  )
}
