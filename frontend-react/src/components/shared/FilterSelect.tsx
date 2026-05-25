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
    <div className={cn('flex shrink-0 items-center gap-2', className)}>
      <label htmlFor={id} className="whitespace-nowrap text-xs font-medium text-slate-500">
        {label}
      </label>
      <Select value={value} onValueChange={(v) => onChange(v as T)}>
        <SelectTrigger id={id}>
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
