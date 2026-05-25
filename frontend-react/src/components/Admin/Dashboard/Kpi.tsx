import { DollarSign, Users2, CreditCard, TrendingUp, type LucideIcon } from 'lucide-react'
import { StatCard } from '../../shared/StatCard'

export interface AdminKpi {
  id: string
  label: string
  value: string
  trendValue: number
  trendDirection: 'up' | 'down' | 'neutral'
  trendLabel: string
  iconName: 'revenue' | 'users' | 'transactions' | 'conversion' | 'ticket' | 'paid' | 'pending' | 'failed'
}

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

export function KpiGrid({ adminKpis }: { adminKpis?: AdminKpi[] }) {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {adminKpis?.map((k) => {
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
