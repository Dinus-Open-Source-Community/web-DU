import { api } from './axios'
import { unwrapApiResponse } from './api-error'
import { API_ROUTES } from './api-path'
import type { IResponse } from '@/lib/types/api'
import type { ManagedUserDetailApiResponse } from '@/lib/user-manage/user-detail-api-types'
import type {
  ManagedUserItem,
  ManagedUserListParams,
  ManagedUsersListResponse,
  UpdateUserRolePayload,
} from '@/lib/user-manage/types'
import {
  parseManagedUserListParams,
  parseManagedUserUidParam,
  parseUpdateUserRolePayload,
} from '@/lib/validator/user-manage'

export async function fetchManagedUserDetail(uid: string) {
  const validatedUid = parseManagedUserUidParam(uid)
  const response = await api.get<IResponse<ManagedUserDetailApiResponse>>(
    API_ROUTES.user.getUserByUid(validatedUid),
  )
  return unwrapApiResponse(response.data, 'Gagal mengambil detail user')
}

export async function fetchManagedUsers(params?: ManagedUserListParams) {
  const validatedParams = parseManagedUserListParams(params)
  const response = await api.get<IResponse<ManagedUsersListResponse>>(
    API_ROUTES.user.getAllManagedUsers(validatedParams),
  )
  return unwrapApiResponse(response.data, 'Gagal mengambil daftar user')
}

export async function updateManagedUserRole(uid: string, payload: UpdateUserRolePayload) {
  const validatedUid = parseManagedUserUidParam(uid)
  const validatedPayload = parseUpdateUserRolePayload(payload)
  const response = await api.patch<IResponse<ManagedUserItem>>(
    API_ROUTES.user.updateUserRoleByUid(validatedUid),
    validatedPayload,
  )
  return unwrapApiResponse(response.data, 'Gagal memperbarui role user')
}

export async function deleteManagedUser(uid: string) {
  const validatedUid = parseManagedUserUidParam(uid)
  const response = await api.delete<IResponse<null>>(
    API_ROUTES.user.deleteManagedUserByUid(validatedUid),
  )

  if (response.data.success === false) {
    throw new Error(response.data.message || response.data.error || 'Gagal menghapus user')
  }

  return response.data
}
