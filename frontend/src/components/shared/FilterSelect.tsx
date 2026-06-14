import type { FilterSelectOption } from '../../lib/types/utils'
import { cn } from '../../lib/utils'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select'

type FilterSelectProps<T extends string> = {
  id: string
  label: string
  value: T
  onChange: (value: T) => void
  options: FilterSelectOption<T>[]
  className?: string
}

export function FilterSelect<T extends string>({ id, label, value, onChange, options, className }: FilterSelectProps<T>) {
  return (
    <div
      className={cn(
        'flex w-full min-w-0 flex-col gap-1.5 sm:w-auto sm:flex-row sm:items-center sm:gap-2',
        className,
      )}>
      <label htmlFor={id} className="shrink-0 text-xs font-medium text-slate-500 sm:whitespace-nowrap">
        {label}
      </label>
      <Select value={value} onValueChange={(v) => onChange(v as T)}>
        <SelectTrigger
          id={id}
          size="sm"
          className="h-9 w-full min-w-0 rounded-xl border-slate-200 px-3 text-xs sm:h-9 sm:w-36 sm:rounded-3xl sm:text-sm md:w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
