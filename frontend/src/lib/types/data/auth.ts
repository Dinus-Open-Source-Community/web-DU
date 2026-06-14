import type { UserRole } from '../common/domain'

export interface ILoginPayload {
  email: string
  password: string
}

export interface IRegisterPayload {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface IAuthTokenResponse {
  token: string
  expires_at?: string
}

export interface IAuthUser {
  uid: string
  name: string
  email: string
  role: UserRole
  avatar_url?: string
  description?: string
  is_verified?: boolean
  created_at?: string
  updated_at?: string
}

/** User yang disimpan di session setelah login. */
export interface IAuthSessionUser {
  uid: string
  name: string
  email: string
  role: UserRole
  avatar_url?: string
}

export interface IAuthResult {
  user: IAuthSessionUser
  redirectPath: string
}

export interface IOAuthTokenPayload {
  token: string
  expiresAt?: string
}
