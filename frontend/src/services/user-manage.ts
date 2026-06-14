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
import type { UserRole } from '@/lib/types/user'
import type { ResolvedSubmissionGraderProfile } from '@/lib/course-detail/staff-submission-grader-presenter'
import {
  parseManagedUserListParams,
  parseManagedUserUidParam,
  parseUpdateUserRolePayload,
} from '@/lib/validator/user-manage'

function normalizeProfileRole(role: string): UserRole | null {
  if (role === 'admin' || role === 'mentor' || role === 'student') return role
  if (role === 'super_admin') return 'admin'
  return null
}

export async function fetchUserProfileLite(uid: string): Promise<ResolvedSubmissionGraderProfile> {
  const data = await fetchManagedUserDetail(uid)

  return {
    uid: data.uid,
    name: data.name,
    avatar_url: data.avatar_url ?? '',
    role: normalizeProfileRole(data.role),
  }
}

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
