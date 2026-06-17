import type { IStudentMyAssignmentsResponse } from '@/lib/types/student-assignments'
import type { StudentMyAssignmentsListApiRaw } from '@/lib/student-assignments/api-types'
import type { IPaginationMeta } from '@/lib/types/common/pagination'
import type { IQueryParamsPayload } from './api-path'
import { API_ROUTES } from './api-path'
import { api } from './axios'
import { unwrapApiResponse, withApiErrorHandling } from './api-error'
import type { IResponse } from '@/lib/types/api'

function mapPaginationMeta(raw: Partial<IPaginationMeta> | undefined): IStudentMyAssignmentsResponse['meta'] {
  return {
    total: raw?.total ?? 0,
    per_page: raw?.per_page ?? 20,
    current_page: raw?.current_page ?? 1,
    total_pages: raw?.total_pages ?? 0,
  }
}

function mapStudentMyAssignmentsResponse(raw: StudentMyAssignmentsListApiRaw): IStudentMyAssignmentsResponse {
  const assignments = Array.isArray(raw.assignments) ? raw.assignments : []

  return {
    assignments,
    meta: mapPaginationMeta(raw.meta),
  }
}

export async function fetchStudentMyAssignments(
  params?: IQueryParamsPayload,
): Promise<IStudentMyAssignmentsResponse> {
  return withApiErrorHandling(async () => {
    const response = await api.get<IResponse<StudentMyAssignmentsListApiRaw>>(
      API_ROUTES.students.getMyAssignments(params),
    )
    const data = unwrapApiResponse(response.data, 'Gagal mengambil daftar tugas')
    return mapStudentMyAssignmentsResponse(data)
  }, 'Gagal mengambil daftar tugas')
}
