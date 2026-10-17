import type { DashboardPeriod } from '@/lib/types/admin/dashboard'
import { UnderlineTabList } from '@/components/shared/UnderlineTabList'

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
    <UnderlineTabList
      value={value}
      options={options}
      onChange={onChange}
      ariaLabel="Periode dashboard"
    />
  )
}
