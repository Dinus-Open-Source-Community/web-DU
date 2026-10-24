import { cn } from '@/lib/utils'

export type UnderlineTabOption<T extends string> = {
  value: T
  label: string
}

type UnderlineTabListProps<T extends string> = {
  value: T
  options: UnderlineTabOption<T>[]
  onChange: (value: T) => void
  ariaLabel: string
  className?: string
  variant?: 'underline' | 'pill'
}

export function UnderlineTabList<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  className,
  variant = 'underline',
}: UnderlineTabListProps<T>) {
  const isPill = variant === 'pill'

  return (
    <div
      className={cn(
        isPill
          ? 'inline-flex w-fit max-w-full flex-wrap items-center gap-1 rounded-lg border-2 border-ink-900/10 bg-paper-paper p-1'
          : 'flex flex-wrap items-center gap-x-1 border-b-2 border-ink-900/10',
        className,
      )}
      role="tablist"
      aria-label={ariaLabel}
    >
      {options.map((opt) => {
        const isActive = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(opt.value)}
            className={cn(
              isPill
                ? cn(
                    'inline-flex h-9 items-center justify-center rounded-md px-4 text-sm transition-all',
                    isActive
                      ? 'bg-brand-blue font-bold text-white shadow-none'
                      : 'font-semibold text-ink-500 hover:bg-paper-white hover:text-ink-800',
                  )
                : cn(
                    '-mb-0.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'border-brand-blue text-ink-900'
                      : 'border-transparent text-ink-500 hover:text-ink-800',
                  ),
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
