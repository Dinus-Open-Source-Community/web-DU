import type { ReactNode } from 'react'

import { appShellGridOverlayClassName } from '@/lib/design/app-shell-tokens'
import { cn } from '@/lib/utils'

type AdminPageShellProps = {
  children: ReactNode
  className?: string
}

/** Latar grid + kontainer konten untuk halaman dalam shell admin. */
export function AdminPageShell({ children, className }: AdminPageShellProps) {
  return (
    <>
      <div aria-hidden className={appShellGridOverlayClassName} />
      <div className={cn('relative z-[1] flex flex-col gap-6', className)}>{children}</div>
    </>
  )
}
