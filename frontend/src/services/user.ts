import { API_ROUTES } from './api-path'
import { api } from './axios'
import {
  parseAvatarUploadFile,
  parseChangePasswordPayload,
  parseUpdateProfilePayload,
} from '@/lib/validator/profile'
import type { IUpdatePasswordPayload, IUpdateProfilePayload } from '@/lib/types/user'

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

export async function updateUserPassword(payload: IUpdatePasswordPayload) {
  const validated = parseChangePasswordPayload({
    old_password: payload.old_password ?? '',
    new_password: payload.new_password ?? '',
  })
  const response = await api.patch(API_ROUTES.user.changePassword, validated)
  return response.data
}
