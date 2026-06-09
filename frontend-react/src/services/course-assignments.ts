import type { CourseAssignmentBulkItem } from '@/lib/course-detail/assignment-overview-types'
import { mapCourseAssignmentBulkList } from '@/lib/course-detail/map-course-assignment-bulk'
import type { IQueryParamsPayload } from './api-path'
import { API_ROUTES } from './api-path'
import { api } from './axios'
import { unwrapApiResponse, withApiErrorHandling } from './api-error'
import type { IResponse } from '@/lib/types/api'

export type CourseAssignmentsListResponse = {
  assignments: CourseAssignmentBulkItem[]
  meta: {
    total: number
    per_page: number
    current_page: number
    total_pages: number
  }
}

function mapPaginationMeta(raw: unknown): CourseAssignmentsListResponse['meta'] {
  const meta = (raw ?? {}) as Record<string, unknown>

  return {
    total: typeof meta.total === 'number' ? meta.total : 0,
    per_page: typeof meta.per_page === 'number' ? meta.per_page : 50,
    current_page: typeof meta.current_page === 'number' ? meta.current_page : 1,
    total_pages: typeof meta.total_pages === 'number' ? meta.total_pages : 0,
  }
}

function mapCourseAssignmentsResponse(raw: unknown): CourseAssignmentsListResponse {
  const assignments = mapCourseAssignmentBulkList(raw)
  const data = (raw ?? {}) as Record<string, unknown>

  return {
    assignments,
    meta: mapPaginationMeta(data.meta),
  }
}

export async function fetchCourseAssignments(
  courseUid: string,
  params?: IQueryParamsPayload,
): Promise<CourseAssignmentsListResponse> {
  return withApiErrorHandling(async () => {
    const response = await api.get<IResponse<unknown>>(
      API_ROUTES.courses.assignments.getAllByCourseUid(courseUid, params),
    )
    const data = unwrapApiResponse(response.data, 'Gagal mengambil daftar tugas kursus')
    return mapCourseAssignmentsResponse(data)
  }, 'Gagal mengambil daftar tugas kursus')
}
