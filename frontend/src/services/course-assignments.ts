import type { CourseAssignmentBulkItem } from '@/lib/course-detail/assignment-overview-types'
import type { CourseAssignmentsListApiRaw } from '@/lib/course-detail/course-assignments-api-types'
import { mapCourseAssignmentBulkList } from '@/lib/course-detail/map-course-assignment-bulk'
import type { IPaginationMeta } from '@/lib/types/common/pagination'
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

function mapPaginationMeta(raw: Partial<IPaginationMeta> | undefined): CourseAssignmentsListResponse['meta'] {
  return {
    total: raw?.total ?? 0,
    per_page: raw?.per_page ?? 50,
    current_page: raw?.current_page ?? 1,
    total_pages: raw?.total_pages ?? 0,
  }
}

function mapCourseAssignmentsResponse(raw: CourseAssignmentsListApiRaw): CourseAssignmentsListResponse {
  const assignments = mapCourseAssignmentBulkList(raw)

  return {
    assignments,
    meta: mapPaginationMeta(raw.meta),
  }
}

export async function fetchCourseAssignments(
  courseUid: string,
  params?: IQueryParamsPayload,
): Promise<CourseAssignmentsListResponse> {
  return withApiErrorHandling(async () => {
    const response = await api.get<IResponse<CourseAssignmentsListApiRaw>>(
      API_ROUTES.courses.assignments.getAllByCourseUid(courseUid, params),
    )
    const data = unwrapApiResponse(response.data, 'Gagal mengambil daftar tugas kursus')
    return mapCourseAssignmentsResponse(data)
  }, 'Gagal mengambil daftar tugas kursus')
}
