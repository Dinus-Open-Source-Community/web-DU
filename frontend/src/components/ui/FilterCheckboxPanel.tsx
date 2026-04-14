'use client'

import { cn } from '@/lib/utils'

type FilterCheckboxPanelProps = {
  title: string
  options: string[]
  selected: string[]
  onToggle: (option: string) => void
  className?: string
  innerClassName?: string
}

export function FilterCheckboxPanel({ title, options, selected, onToggle, className, innerClassName }: FilterCheckboxPanelProps) {
  return (
    <aside className={cn('w-full shrink-0 lg:w-64', className)}>
      <div
        className={cn(
          'sticky top-10 rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]',
          innerClassName
        )}>
        <h3 className="mb-5 px-1 text-sm font-semibold uppercase tracking-wide text-slate-800">{title}</h3>
        <div className="flex flex-col gap-3.5 px-1">
          {options.map((cat) => {
            const isChecked = selected.includes(cat)
            return (
              <label key={cat} className="group flex cursor-pointer items-center gap-3">
                <div
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-[6px] border transition-all duration-200',
                    isChecked ? 'border-primary bg-primary shadow-[0_1px_2px_rgba(0,0,0,0.1)]' : 'border-slate-300 bg-white group-hover:border-primary/50'
                  )}>
                  {isChecked && (
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span
                  className={cn(
                    'text-sm transition-colors',
                    isChecked ? 'font-medium text-slate-900' : 'text-slate-600 group-hover:text-slate-900'
                  )}>
                  {cat}
                </span>
                <input type="checkbox" className="sr-only" checked={isChecked} onChange={() => onToggle(cat)} />
              </label>
            )
          })}
        </div>
      </div>
    </aside>
  )
}
