import { API_ROUTES } from './api-path'
import { unwrapApiResponse, withApiErrorHandling } from './api-error'
import { API_BASE_URL, api } from './axios'
import type { IResponse } from '../lib/types/api'
import type { IAuthTokenResponse, ILoginPayload, IRegisterPayload } from '../lib/types/auth'
import type { IUserData } from '../lib/types/user'

const buildApiUrl = (path: string) => `${API_BASE_URL}${path}`

const encodeObjectPath = (objectPath: string) => objectPath.split('/').map(encodeURIComponent).join('/')

function getFileProxyPath(fileReference: string, fallbackBucket = 'avatars') {
  const trimmedReference = fileReference.trim()
  if (!trimmedReference || trimmedReference.startsWith('blob:') || trimmedReference.startsWith('data:')) return null
  const isAbsoluteHttpUrl = /^https?:\/\//i.test(trimmedReference)

  try {
    const parsedUrl = new URL(trimmedReference, API_BASE_URL)
    const apiOrigin = new URL(API_BASE_URL).origin
    if (parsedUrl.pathname.startsWith('/files/') && (!isAbsoluteHttpUrl || parsedUrl.origin === apiOrigin)) {
      return `${parsedUrl.pathname}${parsedUrl.search}`
    }
  } catch {
    // Fall through to object-key parsing below.
  }

  if (isAbsoluteHttpUrl) return null

  const normalizedObject = trimmedReference.replace(/^\/+/, '')
  if (!normalizedObject) return null

  if (normalizedObject.startsWith('files/')) {
    return `/${encodeObjectPath(normalizedObject)}`
  }

  if (normalizedObject.startsWith(`${fallbackBucket}/`)) {
    return `/files/${encodeObjectPath(normalizedObject)}`
  }

  return `/files/${fallbackBucket}/${encodeObjectPath(normalizedObject)}`
}

async function resolveAuthenticatedAvatarUrl(avatarObject: string) {
  if (!avatarObject) return avatarObject

  const fileProxyPath = getFileProxyPath(avatarObject, 'avatars')
  if (!fileProxyPath) {
    return avatarObject
  }

  const response = await api.get<Blob>(fileProxyPath, {
    responseType: 'blob',
  })

  return URL.createObjectURL(response.data)
}

export async function loginWithEmail(payload: ILoginPayload): Promise<IAuthTokenResponse> {
  return withApiErrorHandling(async () => {
    const response = await api.post<IResponse<IAuthTokenResponse>>(API_ROUTES.auth.login, payload)
    return unwrapApiResponse(response.data, 'Login gagal')
  }, 'Login gagal')
}

export async function registerWithEmail(
  payload: Omit<IRegisterPayload, 'confirmPassword'>,
): Promise<IAuthTokenResponse> {
  return withApiErrorHandling(async () => {
    const response = await api.post<IResponse<IAuthTokenResponse>>(API_ROUTES.auth.register, payload)
    return unwrapApiResponse(response.data, 'Registrasi gagal')
  }, 'Registrasi gagal')
}

export async function getAuthenticatedUser(): Promise<IUserData> {
  return withApiErrorHandling(async () => {
    const response = await api.get<IResponse<IUserData>>(API_ROUTES.user.getSelfData)
    const user = unwrapApiResponse(response.data, 'Data pengguna tidak ditemukan')

    if (!user.avatar_url) return user

    try {
      return {
        ...user,
        avatar_url: await resolveAuthenticatedAvatarUrl(user.avatar_url),
      }
    } catch {
      return user
    }
  }, 'Gagal mengambil data pengguna')
}

export function getGoogleOAuthUrl() {
  return buildApiUrl(API_ROUTES.auth.oauth.googleLogin)
}

export function startGoogleOAuth() {
  window.location.assign(getGoogleOAuthUrl())
}
