'use client'

import { cn } from '@/lib/utils'

export type FilterSelectOption<T extends string = string> = { value: T; label: string }

type FilterSelectProps<T extends string> = {
  id: string
  label: string
  value: T
  onChange: (value: T) => void
  options: FilterSelectOption<T>[]
  className?: string
  selectClassName?: string
}

const selectBase =
  'h-10 rounded-xl border border-slate-200 bg-white px-3 pr-8 text-sm font-medium text-slate-700 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary'

export function FilterSelect<T extends string>({ id, label, value, onChange, options, className, selectClassName }: FilterSelectProps<T>) {
  return (
    <div className={cn('flex shrink-0 items-center gap-2', className)}>
      <label htmlFor={id} className="whitespace-nowrap text-xs font-medium text-slate-500">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className={cn(selectBase, selectClassName)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}
