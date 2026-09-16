import { cn } from '@/lib/utils'

type FilterCheckboxPanelProps = {
  title: string
  options: string[]
  selected: string[]
  onToggle: (option: string) => void
  className?: string
  innerClassName?: string
}

const SCROLLBAR_HIDDEN =
  '[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'

function FilterCheckboxOption({
  label,
  checked,
  onToggle,
  compact = false,
}: {
  label: string
  checked: boolean
  onToggle: () => void
  compact?: boolean
}) {
  if (compact) {
    return (
      <button
        type="button"
        aria-pressed={checked}
        onClick={onToggle}
        className={cn(
          'shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:py-2 sm:text-sm',
          checked
            ? 'border-primary bg-primary/10 text-primary'
            : 'border-input bg-card text-muted-foreground hover:border-line-medium hover:text-foreground',
        )}>
        {label}
      </button>
    )
  }

  return (
    <label className="group flex cursor-pointer items-center gap-3">
      <div
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border transition-all duration-200',
          checked ? 'border-primary bg-primary shadow-[0_1px_2px_rgba(0,0,0,0.1)]' : 'border-input bg-card group-hover:border-ring/60',
        )}>
        {checked ? (
          <svg className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : null}
      </div>
      <span className={cn('text-sm transition-colors', checked ? 'font-medium text-foreground' : 'text-muted-foreground group-hover:text-foreground')}>
        {label}
      </span>
      <input type="checkbox" className="sr-only" checked={checked} onChange={onToggle} />
    </label>
  )
}

export function FilterCheckboxPanel({ title, options, selected, onToggle, className, innerClassName }: FilterCheckboxPanelProps) {
  return (
    <>
      <div className={cn('w-full lg:hidden', className)}>
        <h3 className="mb-3 px-0.5 text-xs font-semibold uppercase tracking-wide text-foreground sm:text-sm">{title}</h3>
        <div className={cn('flex gap-2 overflow-x-auto pb-1', SCROLLBAR_HIDDEN)}>
          {options.map((category) => (
            <FilterCheckboxOption
              key={category}
              label={category}
              checked={selected.includes(category)}
              onToggle={() => onToggle(category)}
              compact
            />
          ))}
        </div>
      </div>

      <aside className={cn('hidden w-64 shrink-0 lg:block', className)}>
        <div
          className={cn(
            'sticky top-10 rounded-xl border border-input bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] sm:rounded-2xl sm:p-6',
            innerClassName,
          )}>
          <h3 className="mb-4 px-1 text-xs font-semibold uppercase tracking-wide text-foreground sm:mb-5 sm:text-sm">{title}</h3>
          <div className="flex flex-col gap-3 px-1 sm:gap-3.5">
            {options.map((category) => (
              <FilterCheckboxOption
                key={category}
                label={category}
                checked={selected.includes(category)}
                onToggle={() => onToggle(category)}
              />
            ))}
          </div>
        </div>
      </aside>
    </>
  )
}
