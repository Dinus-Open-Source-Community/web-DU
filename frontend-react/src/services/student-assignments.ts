import type { IStudentMyAssignmentsResponse } from '@/lib/types/student-assignments'
import type { IQueryParamsPayload } from './api-path'
import { API_ROUTES } from './api-path'
import { api } from './axios'
import { unwrapApiResponse, withApiErrorHandling } from './api-error'
import type { IResponse } from '@/lib/types/api'

function mapPaginationMeta(raw: unknown): IStudentMyAssignmentsResponse['meta'] {
  const meta = (raw ?? {}) as Record<string, unknown>

  return {
    total: typeof meta.total === 'number' ? meta.total : 0,
    per_page: typeof meta.per_page === 'number' ? meta.per_page : 20,
    current_page: typeof meta.current_page === 'number' ? meta.current_page : 1,
    total_pages: typeof meta.total_pages === 'number' ? meta.total_pages : 0,
  }
}

function mapStudentMyAssignmentsResponse(raw: unknown): IStudentMyAssignmentsResponse {
  const data = (raw ?? {}) as Record<string, unknown>
  const assignments = Array.isArray(data.assignments) ? data.assignments : []

  return {
    assignments: assignments as IStudentMyAssignmentsResponse['assignments'],
    meta: mapPaginationMeta(data.meta),
  }
}

export async function fetchStudentMyAssignments(
  params?: IQueryParamsPayload,
): Promise<IStudentMyAssignmentsResponse> {
  return withApiErrorHandling(async () => {
    const response = await api.get<IResponse<unknown>>(
      API_ROUTES.students.getMyAssignments(params),
    )
    const data = unwrapApiResponse(response.data, 'Gagal mengambil daftar tugas')
    return mapStudentMyAssignmentsResponse(data)
  }, 'Gagal mengambil daftar tugas')
}
