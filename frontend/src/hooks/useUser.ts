'use client'

import { useMemo } from 'react'
import { getActiveUser, type DummyUser, type UserRole } from '@/lib/data/dummyUsers'

export function useUser(): DummyUser {
  return useMemo(() => getActiveUser(), [])
}

export function useRole(): UserRole {
  return useUser().role
}

export function useHasRole(...roles: UserRole[]): boolean {
  return roles.includes(useRole())
}
