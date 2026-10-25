import { API_ROUTES } from './api-path'
import { api } from './axios'
import { unwrapApiResponse } from './api-error'
import {
  parseAvatarUploadFile,
  parseChangePasswordPayload,
  parseUpdateProfilePayload,
} from '@/lib/validator/profile'
import type { IUpdatePasswordPayload, IUpdateProfilePayload } from '@/lib/types/user'
import type { IUserData } from '@/lib/types/data/user'

export async function uploadProfilePhoto(photo: File) {
  const validatedPhoto = parseAvatarUploadFile(photo)
  const formData = new FormData()
  formData.append('avatar', validatedPhoto)

  const response = await api.post(API_ROUTES.avatar.upload, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return response.data
}

export async function updateUserProfile(payload: IUpdateProfilePayload) {
  const validated = parseUpdateProfilePayload(payload)
  const response = await api.patch(API_ROUTES.user.updateProfile, validated)
  return response.data
}

export async function fetchSelfUserData() {
  const response = await api.get<{ data?: IUserData; success?: boolean; error?: string | null }>(API_ROUTES.user.getSelfData)
  return unwrapApiResponse(response.data, 'Gagal mengambil data profil')
}

export async function updateUserPassword(payload: IUpdatePasswordPayload) {
  const validated = parseChangePasswordPayload({
    old_password: payload.old_password ?? '',
    new_password: payload.new_password ?? '',
  })
  const response = await api.patch(API_ROUTES.user.changePassword, validated)
  return response.data
}
