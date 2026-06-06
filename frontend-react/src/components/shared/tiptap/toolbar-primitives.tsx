import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function ToolbarDivider({ dense }: { dense?: boolean }) {
  return (
    <span
      className={cn('w-px shrink-0 bg-slate-200', dense ? 'mx-0.5 h-4' : 'mx-0.5 h-5')}
      aria-hidden
    />
  )
}

export function ToolbarGroup({ children }: { children: ReactNode }) {
  return <div className="flex items-center gap-0.5">{children}</div>
}

type ToolbarIconButtonProps = {
  label: string
  active?: boolean
  disabled?: boolean
  onClick: () => void
  children: ReactNode
  size?: 'default' | 'compact' | 'bubble'
}

export function ToolbarIconButton({
  label,
  active,
  disabled,
  onClick,
  children,
  size = 'default',
}: ToolbarIconButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={cn(
        'shrink-0 rounded-md p-0 shadow-none active:scale-[0.97]',
        size === 'bubble' && 'size-8',
        size === 'compact' && 'size-8',
        size === 'default' && 'size-9',
        active
          ? 'bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
      )}
    >
      {children}
    </Button>
  )
}
