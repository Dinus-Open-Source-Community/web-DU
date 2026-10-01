import { Command, Search } from 'lucide-react'
import type { KeyboardEvent } from 'react'

import { cn } from '@/lib/utils'

type AppShellNavbarSearchProps = {
  placeholder: string
  value?: string
  onValueChange?: (value: string) => void
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void
  /** Fokus / tombol ⌘K — buka dialog atau aktifkan pencarian. */
  onActivate?: () => void
  className?: string
}

export function AppShellNavbarSearch({
  placeholder,
  value = '',
  onValueChange,
  onKeyDown,
  onActivate,
  className,
}: AppShellNavbarSearchProps) {
  return (
    <div
      className={cn(
        'relative mx-auto w-full max-w-lg min-w-0 flex-1 px-0.5 sm:px-1',
        className,
      )}
    >
      <Search
        className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onValueChange?.(event.target.value)}
        onKeyDown={onKeyDown}
        onFocus={() => onActivate?.()}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-input bg-muted pr-14 pl-10 text-sm text-foreground shadow-none transition-[color,box-shadow,background-color] outline-none placeholder:text-muted-foreground hover:border-line-medium focus-visible:border-ring focus-visible:bg-card focus-visible:ring-3 focus-visible:ring-ring/30 sm:pr-24"
      />
      <button
        type="button"
        onClick={() => onActivate?.()}
        className="absolute top-1/2 right-2 hidden -translate-y-1/2 items-center gap-1 rounded-lg border border-input bg-card px-2 py-1 text-[11px] font-medium text-muted-foreground shadow-xs transition outline-none hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 sm:inline-flex"
        aria-label="Buka pencarian"
      >
        <Command className="size-3" />
        K
      </button>
    </div>
  )
}
