import { API_ROUTES } from './api-path'
import { unwrapApiResponse, withApiErrorHandling } from './api-error'
import { API_BASE_URL, api } from './axios'
import { parseLoginPayload, parseRegisterPayload } from '@/lib/validator/auth'
import type { IResponse } from '../lib/types/api'
import type {
  IAuthTokenResponse,
  ILoginPayload,
  IRegisterPayload,
  IRegisterResponse,
  IResendOtpPayload,
  IVerifyOtpPayload,
} from '../lib/types/auth'
import type { IUserData } from '../lib/types/user'

const buildApiUrl = (path: string) => `${API_BASE_URL}${path}`

export async function loginWithEmail(payload: ILoginPayload): Promise<IAuthTokenResponse> {
  const validated = parseLoginPayload(payload)
  return withApiErrorHandling(async () => {
    const response = await api.post<IResponse<IAuthTokenResponse>>(API_ROUTES.auth.login, validated)
    return unwrapApiResponse(response.data, 'Login gagal')
  }, 'Login gagal')
}

export async function registerWithEmail(
  payload: Omit<IRegisterPayload, 'confirmPassword'>,
): Promise<IRegisterResponse> {
  const validated = parseRegisterPayload(payload)
  return withApiErrorHandling(async () => {
    const response = await api.post<IResponse<IRegisterResponse>>(API_ROUTES.auth.register, validated)
    return unwrapApiResponse(response.data, 'Registrasi gagal')
  }, 'Registrasi gagal')
}

export async function verifyOtp(payload: IVerifyOtpPayload): Promise<IAuthTokenResponse> {
  return withApiErrorHandling(async () => {
    const response = await api.post<IResponse<IAuthTokenResponse>>(API_ROUTES.auth.verifyOtp, payload)
    return unwrapApiResponse(response.data, 'Verifikasi OTP gagal')
  }, 'Verifikasi OTP gagal')
}

export async function resendOtp(payload: IResendOtpPayload): Promise<void> {
  return withApiErrorHandling(async () => {
    const response = await api.post<IResponse<null>>(API_ROUTES.auth.resendOtp, payload)
    unwrapApiResponse(response.data, 'Gagal mengirim ulang kode OTP')
  }, 'Gagal mengirim ulang kode OTP')
}

export async function getAuthenticatedUser(): Promise<IUserData> {
  return withApiErrorHandling(async () => {
    const response = await api.get<IResponse<IUserData>>(API_ROUTES.user.getSelfData)
    return unwrapApiResponse(response.data, 'Data pengguna tidak ditemukan')
  }, 'Gagal mengambil data pengguna')
}

export function getGoogleOAuthUrl() {
  return buildApiUrl(API_ROUTES.auth.oauth.googleLogin)
}

export function startGoogleOAuth() {
  window.location.assign(getGoogleOAuthUrl())
}
