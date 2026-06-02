import type { AxiosError } from 'axios'
import { API_ROUTES } from './api-path'
import { API_BASE_URL, api } from './axios'
import type { IResponse } from '../lib/types/api'
import type { IAuthTokenResponse, ILoginPayload, IRegisterPayload } from '../lib/types/auth'
import type { IUserData } from '../lib/types/user'

const buildApiUrl = (path: string) => `${API_BASE_URL}${path}`

const getMessageFromError = (error: unknown, fallback: string) => {
  const axiosError = error as AxiosError<IResponse<unknown>>
  return axiosError.response?.data?.message || axiosError.response?.data?.error || axiosError.message || fallback
}

const unwrapResponse = <T>(response: IResponse<T>, fallbackMessage: string): T => {
  if (response.success === false) {
    throw new Error(response.message || response.error || fallbackMessage)
  }

  if (response.data == null) {
    throw new Error(response.message || response.error || fallbackMessage)
  }

  return response.data
}

export async function loginWithEmail(payload: ILoginPayload): Promise<IAuthTokenResponse> {
  try {
    const response = await api.post<IResponse<IAuthTokenResponse>>(API_ROUTES.auth.login, payload)
    return unwrapResponse(response.data, 'Login gagal')
  } catch (error) {
    throw new Error(getMessageFromError(error, 'Login gagal'), { cause: error })
  }
}

export async function registerWithEmail(payload: Omit<IRegisterPayload, 'confirmPassword'>): Promise<IAuthTokenResponse> {
  try {
    const response = await api.post<IResponse<IAuthTokenResponse>>(API_ROUTES.auth.register, payload)
    return unwrapResponse(response.data, 'Registrasi gagal')
  } catch (error) {
    throw new Error(getMessageFromError(error, 'Registrasi gagal'), { cause: error })
  }
}

export async function getAuthenticatedUser(token: string): Promise<IUserData> {
  try {
    const response = await api.get<IResponse<IUserData>>(API_ROUTES.user.getSelfData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return unwrapResponse(response.data, 'Data pengguna tidak ditemukan')
  } catch (error) {
    throw new Error(getMessageFromError(error, 'Gagal mengambil data pengguna'), { cause: error })
  }
}

export function getGoogleOAuthUrl() {
  return buildApiUrl(API_ROUTES.auth.oauth.googleLogin)
}

export function startGoogleOAuth() {
  window.location.assign(getGoogleOAuthUrl())
}
