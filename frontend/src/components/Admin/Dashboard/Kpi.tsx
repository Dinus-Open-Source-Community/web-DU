import { DollarSign, Users2, CreditCard, TrendingUp, type LucideIcon } from 'lucide-react'
import { StatCard } from '../../shared/StatCard'
import { cn } from '../../../lib/utils'

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

function KpiSkeleton() {
  return (
    <div className="flex w-full animate-pulse flex-col items-start gap-3 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/70 p-4 shadow-xs">
      <div className="flex w-full items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <div className="h-3 w-20 rounded bg-slate-200" />
          <div className="h-7 w-28 rounded bg-slate-200" />
        </div>
        <div className="h-10 w-10 rounded-xl bg-slate-200" />
      </div>
      <div className="flex items-center gap-2">
        <div className="h-5 w-14 rounded-full bg-slate-200" />
        <div className="h-3 w-24 rounded bg-slate-200" />
      </div>
    </div>
  )
}

export function KpiGrid({ adminKpis, isLoading }: { adminKpis?: AdminKpi[]; isLoading?: boolean }) {
  if (isLoading) {
    return (
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <KpiSkeleton key={i} />
        ))}
      </section>
    )
  }

  return (
    <section className={cn('grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4')}>
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
