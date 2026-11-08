import { api } from './axios'
import { unwrapApiResponse } from './api-error'
import { API_ROUTES } from './api-path'
import type { IResponse } from '@/lib/types/api'
import type { AdminKpi } from '@/lib/types/admin/dashboard'

export type { AdminKpi }

export async function fetchDashboardKpis() {
  const response = await api.get<IResponse<AdminKpi[]>>(
    API_ROUTES.admin.dashboard.kpis({}),
  )
  return unwrapApiResponse(response.data, 'Gagal mengambil data KPI dashboard')
}
