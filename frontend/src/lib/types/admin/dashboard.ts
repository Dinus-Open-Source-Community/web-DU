import type { IChartDataPoint } from '@/lib/types/components/charts'

export type AdminKpiIconName =
  | 'revenue'
  | 'users'
  | 'transactions'
  | 'conversion'
  | 'ticket'
  | 'paid'
  | 'pending'
  | 'failed'

export interface AdminKpi {
  id: string
  label: string
  value: string
  trendValue: number
  trendDirection: 'up' | 'down' | 'neutral'
  trendLabel: string
  iconName: AdminKpiIconName
}

export type DashboardPeriod = '7d' | '30d' | '90d' | '12m'

export interface TransactionSummary {
  grossRevenue: number
  paidCount: number
  pendingCount: number
  failedCount: number
}

export interface FinancialSummary {
  kpis: AdminKpi[]
  monthlyRevenue: IChartDataPoint[]
  revenueByCategory: IChartDataPoint[]
  revenueSource: Array<IChartDataPoint & { color: string }>
}
