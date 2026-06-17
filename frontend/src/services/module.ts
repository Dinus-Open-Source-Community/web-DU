import { API_ROUTES, type IQueryParamsPayload } from './api-path'
import { api } from './axios'
import { getApiErrorMessage, unwrapApiResponse, withApiErrorHandling } from './api-error'
import {
  parseModuleCreateRequest,
  parseModuleCourseUidParam,
  parseModuleListParams,
  parseModuleUidParam,
  parseModuleUpdateRequest,
} from '@/lib/validator/module'
import type { IResponse } from '@/lib/types/api'
import type {
  ICourseDetailModule,
  IModulesByCourseUidResponse,
} from '@/lib/types/module'

export interface ModuleCreateRequest {
  course_uid: string
  title: string
  order_index: number
}

export interface ModuleUpdateRequest {
  title?: string
  order_index?: number
}

export async function fetchModulesByCourseUid(
  courseUid: string,
  params?: IQueryParamsPayload,
): Promise<IModulesByCourseUidResponse> {
  const validatedCourseUid = parseModuleCourseUidParam(courseUid)
  const validatedParams = parseModuleListParams(params)
  const response = await api.get<IResponse<IModulesByCourseUidResponse>>(
    API_ROUTES.modules.getByCourseUid(validatedCourseUid, validatedParams),
  )
  return unwrapApiResponse(response.data, 'Gagal mengambil daftar modul')
}

export async function createModule(
  payload: ModuleCreateRequest,
): Promise<ICourseDetailModule> {
  const validated = parseModuleCreateRequest(payload)

  return withApiErrorHandling(async () => {
    const response = await api.post<IResponse<ICourseDetailModule>>(
      API_ROUTES.modules.create,
      validated,
    )
    return unwrapApiResponse(response.data, 'Gagal membuat modul')
  }, 'Gagal membuat modul')
}

export async function updateModule(
  uid: string,
  payload: ModuleUpdateRequest,
): Promise<ICourseDetailModule> {
  const validatedUid = parseModuleUidParam(uid)
  const validatedPayload = parseModuleUpdateRequest(payload)

  return withApiErrorHandling(async () => {
    const response = await api.put<IResponse<ICourseDetailModule>>(
      API_ROUTES.modules.updateByUid(validatedUid),
      validatedPayload,
    )
    return unwrapApiResponse(response.data, 'Gagal memperbarui modul')
  }, 'Gagal memperbarui modul')
}

export async function deleteModule(uid: string): Promise<void> {
  const validatedUid = parseModuleUidParam(uid)
  try {
    await api.delete<IResponse<null>>(API_ROUTES.modules.deleteByUid(validatedUid))
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Gagal menghapus modul'), { cause: error })
  }
}
