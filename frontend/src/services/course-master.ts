import { api } from './axios'
import { unwrapApiResponse } from './api-error'
import { API_ROUTES } from './api-path'
import type { IResponse } from '@/lib/types/api'
import type { ICategoryItem, ICourseTypeItem } from '@/lib/types/course'
import type {
  CreateCourseMasterPayload,
  UpdateCourseMasterPayload,
} from '@/lib/course-master/types'
import {
  parseCourseMasterUidParam,
  parseCreateCourseMasterPayload,
  parseUpdateCourseMasterPayload,
} from '@/lib/validator/course-master'

export async function createCourseCategory(payload: CreateCourseMasterPayload) {
  const validatedPayload = parseCreateCourseMasterPayload(payload)
  const response = await api.post<IResponse<ICategoryItem>>(
    API_ROUTES.courseCategories.create,
    validatedPayload,
  )
  return unwrapApiResponse(response.data, 'Gagal membuat kategori kursus')
}

export async function updateCourseCategory(uid: string, payload: UpdateCourseMasterPayload) {
  const validatedUid = parseCourseMasterUidParam(uid)
  const validatedPayload = parseUpdateCourseMasterPayload(payload)
  const response = await api.put<IResponse<ICategoryItem>>(
    API_ROUTES.courseCategories.updateByUid(validatedUid),
    validatedPayload,
  )
  return unwrapApiResponse(response.data, 'Gagal memperbarui kategori kursus')
}

export async function deleteCourseCategory(uid: string) {
  const validatedUid = parseCourseMasterUidParam(uid)
  const response = await api.delete<IResponse<null>>(
    API_ROUTES.courseCategories.deleteByUid(validatedUid),
  )
  return unwrapApiResponse(response.data, 'Gagal menghapus kategori kursus')
}

export async function fetchCourseTypeByUid(uid: string) {
  const validatedUid = parseCourseMasterUidParam(uid)
  const response = await api.get<IResponse<ICourseTypeItem>>(
    API_ROUTES.courseTypes.getByUid(validatedUid),
  )
  return unwrapApiResponse(response.data, 'Gagal mengambil tipe kursus')
}

export async function createCourseType(payload: CreateCourseMasterPayload) {
  const validatedPayload = parseCreateCourseMasterPayload(payload)
  const response = await api.post<IResponse<ICourseTypeItem>>(
    API_ROUTES.courseTypes.create,
    validatedPayload,
  )
  return unwrapApiResponse(response.data, 'Gagal membuat tipe kursus')
}

export async function updateCourseType(uid: string, payload: UpdateCourseMasterPayload) {
  const validatedUid = parseCourseMasterUidParam(uid)
  const validatedPayload = parseUpdateCourseMasterPayload(payload)
  const response = await api.put<IResponse<ICourseTypeItem>>(
    API_ROUTES.courseTypes.updateByUid(validatedUid),
    validatedPayload,
  )
  return unwrapApiResponse(response.data, 'Gagal memperbarui tipe kursus')
}

export async function deleteCourseType(uid: string) {
  const validatedUid = parseCourseMasterUidParam(uid)
  const response = await api.delete<IResponse<null>>(
    API_ROUTES.courseTypes.deleteByUid(validatedUid),
  )
  return unwrapApiResponse(response.data, 'Gagal menghapus tipe kursus')
}
