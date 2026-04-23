'use client'

import { useMemo } from 'react'
import { useAuth } from '@/providers/auth-provider'
import type { AuthUser, UserRole } from '@/lib/auth/session'

export type { UserRole } from '@/lib/auth/session'

const EMPTY_USER: AuthUser = {
  uid: '',
  nama: '',
  role: 'student',
  email: '',
  avatar: undefined,
}

export function useUser(): AuthUser {
  const { user } = useAuth()

  return useMemo(() => user ?? EMPTY_USER, [user])
}

export function useRole(): UserRole {
  return useUser().role
}

export function useHasRole(...roles: UserRole[]): boolean {
  return roles.includes(useRole())
}
