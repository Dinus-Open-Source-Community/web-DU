import type { IStudentMyAssignmentsResponse } from '@/lib/types/student-assignments'
import { normalizeStudentMyAssignmentsListApiRaw } from '@/lib/student-assignments/normalize-student-my-assignments-api'
import type { StudentMyAssignmentsListApiRaw } from '@/lib/student-assignments/api-types'
import type { IQueryParamsPayload } from './api-path'
import { API_ROUTES } from './api-path'
import { api } from './axios'
import { unwrapApiResponse, withApiErrorHandling } from './api-error'
import type { IResponse } from '@/lib/types/api'

const STUDENT_ASSIGNMENTS_MAX_PER_PAGE = 100

function mapStudentMyAssignmentsResponse(raw: StudentMyAssignmentsListApiRaw | unknown): IStudentMyAssignmentsResponse {
  return normalizeStudentMyAssignmentsListApiRaw(raw)
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

/** Ambil seluruh halaman tugas student (BE max `per_page` = 100). */
export async function fetchAllStudentMyAssignments(): Promise<IStudentMyAssignmentsResponse> {
  const firstPage = await fetchStudentMyAssignments({
    page: 1,
    per_page: STUDENT_ASSIGNMENTS_MAX_PER_PAGE,
  })

  const totalPages = Math.max(firstPage.meta.total_pages, 1)
  if (totalPages <= 1) return firstPage

  const mergedAssignments = [...firstPage.assignments]

  for (let page = 2; page <= totalPages; page += 1) {
    try {
      const nextPage = await fetchStudentMyAssignments({
        page,
        per_page: STUDENT_ASSIGNMENTS_MAX_PER_PAGE,
      })
      mergedAssignments.push(...nextPage.assignments)
    } catch {
      break
    }
  }

  return {
    assignments: mergedAssignments,
    meta: {
      ...firstPage.meta,
      current_page: 1,
      per_page: mergedAssignments.length,
      total_pages: 1,
      total: mergedAssignments.length,
    },
  }
}
