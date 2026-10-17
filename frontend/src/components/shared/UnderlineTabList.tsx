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
}

export function UnderlineTabList<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  className,
}: UnderlineTabListProps<T>) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-x-1 border-b-2 border-ink-900/10',
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
              '-mb-0.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'border-brand-blue text-ink-900'
                : 'border-transparent text-ink-500 hover:text-ink-800',
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
