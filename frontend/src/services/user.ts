import { API_ROUTES } from './api-path'
import { api } from './axios'
import { unwrapApiResponse } from './api-error'
import {
  parseAvatarUploadFile,
  parseChangePasswordPayload,
  parseUpdateEmailPayload,
  parseUpdateProfilePayload,
} from '@/lib/validator/profile'
import type {
  IConfirmEmailChangePayload,
  IConfirmEmailChangeResponse,
  IRequestEmailChangePayload,
  IRequestEmailChangeResponse,
  IUpdatePasswordPayload,
  IUpdateProfilePayload,
} from '@/lib/types/user'
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

export async function requestUserEmailChange(payload: IRequestEmailChangePayload) {
  const validated = parseUpdateEmailPayload({
    email: payload.new_email,
    password: payload.password,
  })
  const response = await api.post<{
    data?: IRequestEmailChangeResponse
    success?: boolean
    message?: string
    error?: string | null
  }>(API_ROUTES.user.requestEmailChange, {
    new_email: validated.email,
    password: validated.password,
  })
  return unwrapApiResponse(response.data, 'Gagal mengajukan perubahan alamat email')
}

export async function confirmUserEmailChange(payload: IConfirmEmailChangePayload) {
  const response = await api.post<{
    data?: IConfirmEmailChangeResponse
    success?: boolean
    message?: string
    error?: string | null
  }>(API_ROUTES.user.confirmEmailChange, payload)
  return unwrapApiResponse(response.data, 'Gagal mengonfirmasi perubahan alamat email')
}
