import {
  DollarSign,
  Users2,
  CreditCard,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'

import { StatCard } from '@/components/dashboard/StatCard'
import { adminDashboardKpis, type AdminKpi } from '@/lib/data/admin-fixtures'

const iconMap: Record<AdminKpi['iconName'], LucideIcon> = {
  revenue: DollarSign,
  users: Users2,
  transactions: CreditCard,
  conversion: TrendingUp,
  ticket: DollarSign,
  paid: DollarSign,
  pending: DollarSign,
  failed: DollarSign,
}

export function KpiGrid() {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {adminDashboardKpis.map((k) => {
        const Icon = iconMap[k.iconName]
        return (
          <StatCard
            key={k.id}
            variant="kpi"
            label={k.label}
            value={k.value}
            trendValue={k.trendValue}
            trendDirection={k.trendDirection}
            trendLabel={k.trendLabel}
            icon={<Icon className="h-5 w-5" aria-hidden />}
          />
        )
      })}
    </section>
  )
}
