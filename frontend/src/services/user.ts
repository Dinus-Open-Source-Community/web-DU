import { API_ROUTES } from './api-path'
import { api } from './axios'
import type { IUpdatePasswordPayload, IUpdateProfilePayload } from '@/lib/types/user'

export async function uploadProfilePhoto(photo: File) {
  const formData = new FormData()
  formData.append('avatar', photo)

  const response = await api.post(API_ROUTES.avatar.upload, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return response.data
}

export async function updateUserProfile(payload: IUpdateProfilePayload) {
  const response = await api.patch(API_ROUTES.user.updateProfile, payload)
  return response.data
}

export async function updateUserPassword(payload: IUpdatePasswordPayload) {
  const response = await api.patch(API_ROUTES.user.changePassword, payload)
  return response.data
}
