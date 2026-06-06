import { api } from './axios'
import { unwrapApiResponse } from './api-error'
import { API_ROUTES } from './api-path'
import type { IResponse } from '@/lib/types/api'
import type {
  ManagedUserItem,
  ManagedUserListParams,
  ManagedUsersListResponse,
  UpdateUserRolePayload,
} from '@/lib/user-manage/types'

export async function fetchManagedUsers(params?: ManagedUserListParams) {
  const response = await api.get<IResponse<ManagedUsersListResponse>>(
    API_ROUTES.user.getAllManagedUsers(params),
  )
  return unwrapApiResponse(response.data, 'Gagal mengambil daftar user')
}

export async function updateManagedUserRole(uid: string, payload: UpdateUserRolePayload) {
  const response = await api.patch<IResponse<ManagedUserItem>>(
    API_ROUTES.user.updateUserRoleByUid(uid),
    payload,
  )
  return unwrapApiResponse(response.data, 'Gagal memperbarui role user')
}

export async function deleteManagedUser(uid: string) {
  const response = await api.delete<IResponse<null>>(
    API_ROUTES.user.deleteManagedUserByUid(uid),
  )

  if (response.data.success === false) {
    throw new Error(response.data.message || response.data.error || 'Gagal menghapus user')
  }

  return response.data
}
