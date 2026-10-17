import { api } from './axios'
import { unwrapApiResponse } from './api-error'
import { API_ROUTES } from './api-path'
import type { IResponse } from '@/lib/types/api'
import type {
  AdminKpi,
  DashboardPeriod,
  FinancialSummary,
  TransactionSummary,
} from '@/lib/types/admin/dashboard'
import type { IAdminTransaction } from '@/lib/types/transaction'

export type { AdminKpi, DashboardPeriod, FinancialSummary, TransactionSummary }

export async function fetchDashboardKpis(period: DashboardPeriod = '30d') {
  const response = await api.get<IResponse<AdminKpi[]>>(
    API_ROUTES.admin.dashboard.kpis({ period }),
  )
  return unwrapApiResponse(response.data, 'Gagal mengambil data KPI dashboard')
}

export async function fetchRecentTransactions(
  limit = 5,
  period?: DashboardPeriod,
) {
  const response = await api.get<IResponse<IAdminTransaction[]>>(
    API_ROUTES.admin.dashboard.recentTransactions({ limit, period }),
  )
  return unwrapApiResponse(response.data, 'Gagal mengambil transaksi terbaru')
}

export async function fetchTransactionSummary(period?: DashboardPeriod) {
  const response = await api.get<IResponse<TransactionSummary>>(
    API_ROUTES.admin.transactions.summary({ period }),
  )
  return unwrapApiResponse(response.data, 'Gagal mengambil ringkasan transaksi')
}

export async function fetchFinancialSummary(period?: DashboardPeriod) {
  const response = await api.get<IResponse<FinancialSummary>>(
    API_ROUTES.admin.financial.summary({ period }),
  )
  return unwrapApiResponse(response.data, 'Gagal mengambil ringkasan keuangan')
}
