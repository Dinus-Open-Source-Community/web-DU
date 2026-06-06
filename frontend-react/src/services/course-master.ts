import { api } from './axios'
import { unwrapApiResponse } from './api-error'
import { API_ROUTES } from './api-path'
import type { IResponse } from '@/lib/types/api'
import type { ICategoryItem, ICourseTypeItem } from '@/lib/types/course'
import type {
  CreateCourseMasterPayload,
  UpdateCourseMasterPayload,
} from '@/lib/course-master/types'

export async function createCourseCategory(payload: CreateCourseMasterPayload) {
  const response = await api.post<IResponse<ICategoryItem>>(
    API_ROUTES.courseCategories.create,
    payload,
  )
  return unwrapApiResponse(response.data, 'Gagal membuat kategori kursus')
}

export async function updateCourseCategory(uid: string, payload: UpdateCourseMasterPayload) {
  const response = await api.put<IResponse<ICategoryItem>>(
    API_ROUTES.courseCategories.updateByUid(uid),
    payload,
  )
  return unwrapApiResponse(response.data, 'Gagal memperbarui kategori kursus')
}

export async function deleteCourseCategory(uid: string) {
  const response = await api.delete<IResponse<null>>(
    API_ROUTES.courseCategories.deleteByUid(uid),
  )
  return unwrapApiResponse(response.data, 'Gagal menghapus kategori kursus')
}

export async function fetchCourseTypeByUid(uid: string) {
  const response = await api.get<IResponse<ICourseTypeItem>>(
    API_ROUTES.courseTypes.getByUid(uid),
  )
  return unwrapApiResponse(response.data, 'Gagal mengambil tipe kursus')
}

export async function createCourseType(payload: CreateCourseMasterPayload) {
  const response = await api.post<IResponse<ICourseTypeItem>>(
    API_ROUTES.courseTypes.create,
    payload,
  )
  return unwrapApiResponse(response.data, 'Gagal membuat tipe kursus')
}

export async function updateCourseType(uid: string, payload: UpdateCourseMasterPayload) {
  const response = await api.put<IResponse<ICourseTypeItem>>(
    API_ROUTES.courseTypes.updateByUid(uid),
    payload,
  )
  return unwrapApiResponse(response.data, 'Gagal memperbarui tipe kursus')
}

export async function deleteCourseType(uid: string) {
  const response = await api.delete<IResponse<null>>(
    API_ROUTES.courseTypes.deleteByUid(uid),
  )
  return unwrapApiResponse(response.data, 'Gagal menghapus tipe kursus')
}
