import { api } from './axios'
import { unwrapApiResponse } from './api-error'
import { API_ROUTES, type IQueryParamsPayload } from './api-path'
import type { IResponse } from '@/lib/types/api'
import type {
  ICategoryItem,
  ICategoryListResponse,
  ICourseListResponse,
  ICourseStudentListResponse,
  ICourseTypeListResponse,
  IDetailCourseResponse,
} from '@/lib/types/course'
import {
  buildCreateCourseFormData,
  buildUpdateCourseFormData,
} from '@/lib/course-form/build-form-data'
import type {
  CreateCoursePayload,
  UpdateCoursePayload,
  UpdateCourseStatusRequest,
} from '@/lib/course-form/types'
import {
  parseAssignMentorsCourseUidParam,
  parseAssignMentorsToCoursePayload,
} from '@/lib/validator/course-mentor'
import {
  parseCourseUidParam,
  parseCreateCoursePayload,
  parseUpdateCoursePayload,
  parseUpdateCourseStatusRequest,
} from '@/lib/validator/course-form'

export type { CreateCoursePayload, UpdateCoursePayload, UpdateCourseStatusRequest }
import type {
  AssignMentorsToCoursePayload,
  AssignMentorsToCourseResponse,
} from '@/lib/course-mentor/types'
import type { ICourseDetailModule } from '@/lib/types/module'
import { fetchLessonsByModuleUid } from './lessons'
import { fetchModulesByCourseUid } from './module'

export async function fetchCourses(params?: IQueryParamsPayload) {
  const response = await api.get<IResponse<ICourseListResponse>>(
    API_ROUTES.courses.getAll(params),
  )
  return unwrapApiResponse(response.data, 'Gagal mengambil daftar kursus')
}

export async function fetchCourseByUid(uid: string) {
  const response = await api.get<IResponse<IDetailCourseResponse>>(
    API_ROUTES.courses.getByUid(uid),
  )
  return unwrapApiResponse(response.data, 'Gagal mengambil detail kursus')
}

export async function fetchCourseCategories(params?: IQueryParamsPayload) {
  const response = await api.get<IResponse<ICategoryListResponse>>(
    API_ROUTES.courseCategories.getAll(params),
  )
  return unwrapApiResponse(response.data, 'Gagal mengambil kategori kursus')
}

export async function fetchCourseCategoryByUid(id: string) {
  const response = await api.get<IResponse<ICategoryItem>>(
    API_ROUTES.courseCategories.getByUid(id),
  )
  return unwrapApiResponse(response.data, 'Gagal mengambil kategori kursus')
}

export async function fetchCourseTypes(params?: IQueryParamsPayload) {
  const response = await api.get<IResponse<ICourseTypeListResponse>>(
    API_ROUTES.courseTypes.getAll(params),
  )
  return unwrapApiResponse(response.data, 'Gagal mengambil tipe kursus')
}

export async function createCourse(payload: CreateCoursePayload) {
  const validatedPayload = parseCreateCoursePayload(payload)
  const formData = buildCreateCourseFormData(validatedPayload)
  const response = await api.post<IResponse<IDetailCourseResponse>>(API_ROUTES.courses.create, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return unwrapApiResponse(response.data, 'Gagal membuat kursus')
}

export async function updateCourse(uid: string, payload: UpdateCoursePayload) {
  const validatedUid = parseCourseUidParam(uid)
  const validatedPayload = parseUpdateCoursePayload(payload)
  const formData = buildUpdateCourseFormData(validatedPayload)
  const response = await api.put<IResponse<IDetailCourseResponse>>(
    API_ROUTES.courses.updateByUid(validatedUid),
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  )
  return unwrapApiResponse(response.data, 'Gagal memperbarui kursus')
}

/**
 * PATCH /courses/:id/status
 * - Tanpa request body (hanya course UID di path)
 * - BE mengubah field `status` → ACTIVE
 * - BE tidak mengubah `is_published`; UI harus baca `status` juga (lihat isCoursePublished)
 */
export async function updateCourseStatus(request: UpdateCourseStatusRequest) {
  const validatedRequest = parseUpdateCourseStatusRequest(request)
  const response = await api.patch<IResponse<unknown>>(
    API_ROUTES.courses.updateStatusByUid(validatedRequest.courseUid),
  )
  return unwrapApiResponse(response.data, 'Gagal memperbarui status kursus')
}

export async function fetchCourseStudents(courseUid: string) {
  const response = await api.get<IResponse<ICourseStudentListResponse>>(
    API_ROUTES.courses.getStudentsByUid(courseUid),
  )
  return unwrapApiResponse(response.data, 'Gagal mengambil peserta kursus')
}

export async function assignMentorsToCourse(
  courseUid: string,
  payload: AssignMentorsToCoursePayload,
) {
  const validatedCourseUid = parseAssignMentorsCourseUidParam(courseUid)
  const validatedPayload = parseAssignMentorsToCoursePayload(payload)
  const response = await api.post<IResponse<AssignMentorsToCourseResponse>>(
    API_ROUTES.courses.assignMentorsByUid(validatedCourseUid),
    validatedPayload,
  )
  return unwrapApiResponse(response.data, 'Gagal menugaskan mentor ke kursus')
}

export function stripLessonsFromModules(
  modules: ICourseDetailModule[],
): ICourseDetailModule[] {
  return modules.map((module) => ({
    ...module,
    lessons: [],
  }))
}

export async function fetchCourseEditSnapshot(courseUid: string) {
  const [course, modulesResponse] = await Promise.all([
    fetchCourseByUid(courseUid),
    fetchModulesByCourseUid(courseUid, { per_page: 100 }),
  ])

  const moduleList = modulesResponse.modules ?? []
  const lessonsByModuleEntries = await Promise.all(
    moduleList.map(async (module) => {
      const lessonsResponse = await fetchLessonsByModuleUid(module.uid, { per_page: 100 })
      return [module.uid, lessonsResponse.lessons ?? []] as const
    }),
  )

  return {
    course,
    modules: stripLessonsFromModules(moduleList),
    lessonsByModule: Object.fromEntries(lessonsByModuleEntries),
  }
}

export { fetchModulesByCourseUid }
