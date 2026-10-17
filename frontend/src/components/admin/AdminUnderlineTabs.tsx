import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export type AdminUnderlineTabItem<T extends string> = {
  value: T
  label: string
  icon?: ReactNode
}

type AdminUnderlineTabsProps<T extends string> = {
  value: T
  items: AdminUnderlineTabItem<T>[]
  onChange: (value: T) => void
  ariaLabel?: string
  className?: string
}

export function AdminUnderlineTabs<T extends string>({
  value,
  items,
  onChange,
  ariaLabel,
  className,
}: AdminUnderlineTabsProps<T>) {
  return (
    <div
      className={cn('flex flex-wrap items-center gap-x-1 border-b-2 border-border', className)}
      role="tablist"
      aria-label={ariaLabel}
    >
      {items.map((item) => {
        const isActive = value === item.value
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(item.value)}
            className={cn(
              '-mb-0.5 inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {item.icon}
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
