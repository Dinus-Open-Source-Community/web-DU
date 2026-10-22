import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type AdminPageShellProps = {
  children: ReactNode
  className?: string
}

/** Kontainer konten untuk halaman dalam shell admin (latar grid disediakan oleh shell). */
export function AdminPageShell({ children, className }: AdminPageShellProps) {
  return (
    <div className={cn('relative z-[1] flex flex-col gap-6', className)}>{children}</div>
  )
}
