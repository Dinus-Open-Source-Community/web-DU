import { cn } from '../../../lib/utils'
import type { DashboardPeriod } from '@/lib/types/admin/dashboard'

interface PeriodOption {
  value: DashboardPeriod
  label: string
}

interface PeriodSelectorProps {
  value: DashboardPeriod
  options: PeriodOption[]
  onChange: (period: DashboardPeriod) => void
}

export function PeriodSelector({ value, options, onChange }: PeriodSelectorProps) {
  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50/80 p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'rounded-md px-3 py-1.5 text-xs font-medium transition-all',
            value === opt.value
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
