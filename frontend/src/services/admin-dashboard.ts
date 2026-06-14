import { api } from './axios'
import { unwrapApiResponse } from './api-error'
import { API_ROUTES } from './api-path'
import type { IResponse } from '@/lib/types/api'
import type { AdminKpi } from '@/components/Admin/Dashboard/Kpi'
import type { IAdminTransaction } from '@/lib/types/transaction'
import type { IChartDataPoint } from '@/lib/types/components/charts'

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

export async function fetchDashboardKpis(period: DashboardPeriod = '30d') {
  const response = await api.get<IResponse<AdminKpi[]>>(
    API_ROUTES.admin.dashboard.kpis({ period }),
  )
  return unwrapApiResponse(response.data, 'Gagal mengambil data KPI dashboard')
}

export async function fetchRecentTransactions(limit = 5) {
  const response = await api.get<IResponse<IAdminTransaction[]>>(
    API_ROUTES.admin.dashboard.recentTransactions({ limit }),
  )
  return unwrapApiResponse(response.data, 'Gagal mengambil transaksi terbaru')
}

export async function fetchTransactionSummary() {
  const response = await api.get<IResponse<TransactionSummary>>(
    API_ROUTES.admin.transactions.summary(),
  )
  return unwrapApiResponse(response.data, 'Gagal mengambil ringkasan transaksi')
}

export async function fetchFinancialSummary() {
  const response = await api.get<IResponse<FinancialSummary>>(
    API_ROUTES.admin.financial.summary,
  )
  return unwrapApiResponse(response.data, 'Gagal mengambil ringkasan keuangan')
}

