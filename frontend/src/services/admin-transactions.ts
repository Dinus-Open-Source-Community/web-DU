import { api } from './axios'
import { unwrapApiResponse } from './api-error'
import { API_ROUTES, type IQueryParamsPayload } from './api-path'
import type { IResponse } from '@/lib/types/api'
import type { IAdminTransaction } from '@/lib/types/transaction'
import type { TransactionSummary } from './admin-dashboard'

export interface AdminTransactionsListData {
  transactions: IAdminTransaction[]
  meta: {
    current_page: number
    per_page: number
    total: number
    total_pages: number
  }
  summary: TransactionSummary
}

export interface AdminTransactionsParams extends IQueryParamsPayload {
  search?: string
  date_from?: string
  date_to?: string
}

export async function fetchAdminTransactions(params?: AdminTransactionsParams) {
  const response = await api.get<IResponse<AdminTransactionsListData>>(
    API_ROUTES.admin.transactions.list(params),
  )
  return unwrapApiResponse(response.data, 'Gagal mengambil daftar transaksi')
}
