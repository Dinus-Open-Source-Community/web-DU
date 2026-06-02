import type { UserRole } from './user'

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

export interface IAuthSessionUser {
  uid: string
  name: string
  email: string
  role: UserRole
  avatarUrl?: string
}

export interface IAuthResult {
  user: IAuthSessionUser
  redirectPath: string
}

export interface IOAuthTokenPayload {
  token: string
  expiresAt?: string
}
