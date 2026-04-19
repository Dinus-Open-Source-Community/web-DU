import type { AdminKpi } from './admin'

/** Grafik & agregat analytics admin. */

export interface ChartDataPoint {
  label: string
  value: number
}

export interface TransactionTimelinePoint {
  label: string
  paid: number
  pending: number
  failed: number
  [key: string]: string | number
}

export interface EngagementTrendPoint {
  label: string
  active: number
  completed: number
  [key: string]: string | number
}

export interface ChartRatioPoint {
  label: string
  value: number
  color: string
}

export interface AnalyticsData {
  kpis: AdminKpi[]
  revenueLine30d: ChartDataPoint[]
  newUsersWeek: ChartDataPoint[]
  topCoursesByEnrolment: ChartDataPoint[]
  transactionTimeline30d: TransactionTimelinePoint[]
  transactionRatio: ChartRatioPoint[]
  learningEngagementTrend: EngagementTrendPoint[]
  completionRateByCategory: ChartDataPoint[]
  dropOffFunnel: ChartDataPoint[]
  monthlyRevenue12m: ChartDataPoint[]
  revenueByCategory: ChartDataPoint[]
  revenueSourceRatio: ChartRatioPoint[]
}
