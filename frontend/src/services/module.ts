import { API_ROUTES, type IQueryParamsPayload } from './api-path'
import { api } from './axios'
import { getApiErrorMessage, unwrapApiResponse, withApiErrorHandling } from './api-error'
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

function assertModuleCreatePayload(payload: ModuleCreateRequest) {
  const title = payload.title?.trim()
  if (!payload.course_uid?.trim()) {
    throw new Error('course_uid wajib diisi untuk membuat modul')
  }
  if (!title) {
    throw new Error('Judul modul wajib diisi')
  }
  if (!Number.isInteger(payload.order_index) || payload.order_index < 1) {
    throw new Error('Urutan modul minimal 1')
  }
}

function assertModuleUpdatePayload(payload: ModuleUpdateRequest) {
  if (payload.title !== undefined && !payload.title.trim()) {
    throw new Error('Judul modul tidak boleh kosong')
  }
  if (
    payload.order_index !== undefined &&
    (!Number.isInteger(payload.order_index) || payload.order_index < 1)
  ) {
    throw new Error('Urutan modul minimal 1')
  }
}

export async function fetchModulesByCourseUid(
  courseUid: string,
  params?: IQueryParamsPayload,
): Promise<IModulesByCourseUidResponse> {
  const response = await api.get<IResponse<IModulesByCourseUidResponse>>(
    API_ROUTES.modules.getByCourseUid(courseUid, params),
  )
  return unwrapApiResponse(response.data, 'Gagal mengambil daftar modul')
}

export async function createModule(
  payload: ModuleCreateRequest,
): Promise<ICourseDetailModule> {
  assertModuleCreatePayload(payload)

  return withApiErrorHandling(async () => {
    const response = await api.post<IResponse<ICourseDetailModule>>(
      API_ROUTES.modules.create,
      {
        course_uid: payload.course_uid.trim(),
        title: payload.title.trim(),
        order_index: payload.order_index,
      },
    )
    return unwrapApiResponse(response.data, 'Gagal membuat modul')
  }, 'Gagal membuat modul')
}

export async function updateModule(
  uid: string,
  payload: ModuleUpdateRequest,
): Promise<ICourseDetailModule> {
  assertModuleUpdatePayload(payload)

  return withApiErrorHandling(async () => {
    const response = await api.put<IResponse<ICourseDetailModule>>(
      API_ROUTES.modules.updateByUid(uid),
      payload,
    )
    return unwrapApiResponse(response.data, 'Gagal memperbarui modul')
  }, 'Gagal memperbarui modul')
}

export async function deleteModule(uid: string): Promise<void> {
  try {
    await api.delete<IResponse<null>>(API_ROUTES.modules.deleteByUid(uid))
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Gagal menghapus modul'), { cause: error })
  }
}
