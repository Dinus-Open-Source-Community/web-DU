import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type ToolbarControlSize = 'default' | 'compact' | 'bubble'

export function ToolbarShell({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      role="toolbar"
      aria-label="Toolbar editor"
      className={cn(
        'sticky top-0 z-10 border-b border-slate-200/80 bg-white/95 backdrop-blur-sm',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function ToolbarDivider({ dense }: { dense?: boolean }) {
  return (
    <span
      className={cn('w-px shrink-0 bg-slate-200/90', dense ? 'mx-0.5 h-4' : 'mx-1 h-6')}
      aria-hidden
    />
  )
}

export function ToolbarGroup({
  children,
  surface,
}: {
  children: ReactNode
  surface?: boolean
}) {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center gap-0.5',
        surface && 'rounded-lg bg-slate-50/90 p-0.5 ring-1 ring-slate-200/60',
      )}
    >
      {children}
    </div>
  )
}

export function ToolbarRow({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={cn('flex items-center px-3', className)}>{children}</div>
}

type ToolbarIconButtonProps = {
  label: string
  active?: boolean
  disabled?: boolean
  onClick: () => void
  /** Run the action on mouse down so the editor keeps its text selection. */
  actionOnMouseDown?: boolean
  children: ReactNode
  size?: ToolbarControlSize
}

export function ToolbarIconButton({
  label,
  active,
  disabled,
  onClick,
  actionOnMouseDown = false,
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
      onMouseDown={(event) => {
        event.preventDefault()
        if (actionOnMouseDown) onClick()
      }}
      onClick={() => {
        if (!actionOnMouseDown) onClick()
      }}
      className={cn(
        'shrink-0 rounded-lg p-0 shadow-none transition-colors active:scale-[0.97]',
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

type ToolbarMenuButtonProps = Omit<ComponentPropsWithoutRef<typeof Button>, 'children' | 'size'> & {
  label: string
  icon: ReactNode
  showChevron?: boolean
  controlSize?: ToolbarControlSize
}

export function ToolbarMenuButton({
  label,
  icon,
  showChevron = true,
  controlSize = 'default',
  className,
  ...props
}: ToolbarMenuButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      aria-label={label}
      onMouseDown={(event) => event.preventDefault()}
      className={cn(
        'shrink-0 gap-1.5 rounded-lg font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 data-[state=open]:bg-slate-100 data-[state=open]:text-slate-900',
        controlSize === 'compact' && 'h-8 px-2.5 text-xs',
        controlSize === 'default' && 'h-9 px-3 text-sm',
        className,
      )}
      {...props}
    >
      {icon}
      <span>{label}</span>
      {showChevron ? <ChevronDown className="size-3.5 shrink-0 opacity-50" aria-hidden /> : null}
    </Button>
  )
}

export function toolbarIconSize(size: ToolbarControlSize): string {
  if (size === 'compact' || size === 'bubble') return 'size-3.5'
  return 'size-4'
}
