'use client'

import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { get, patch, del, postFormData, type Envelope } from '@/lib/api/fetcher'
import { queryKeys } from '@/lib/api/query-keys'

// ─── Types ───────────────────────────────────────────────────────────────────

type UserDetail = {
  uid: string
  name: string
  email: string
  avatar_url: string
  role: string
  is_verified: boolean
  description: string
  created_at: string
  updated_at: string
  joined_courses: unknown[]
  course_reviews: unknown[]
  review_summary: unknown
  enrollment_summary: unknown
  mentored_courses: unknown[]
  transaction_history: unknown[]
}

type ManagedUser = {
  uid: string
  name: string
  email: string
  avatar_url: string
  role: string
  is_verified: boolean
  created_at: string
  updated_at: string
}

type ManagedUsersResponse = {
  users: ManagedUser[]
  meta: { page: number; per_page: number; total: number; total_pages: number }
}

type UpdateProfileInput = {
  name?: string
  email?: string
  description?: string
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useSelfUser() {
  return useSuspenseQuery({
    queryKey: queryKeys.user.self(),
    queryFn: () => get<Envelope<UserDetail>>('/user/data').then((r) => r.data),
  })
}

export function useUserByUid(uid: string) {
  return useSuspenseQuery({
    queryKey: queryKeys.user.byUid(uid),
    queryFn: () => get<Envelope<UserDetail>>(`/user/${uid}`).then((r) => r.data),
  })
}

export function useManagedUsers(filters: { page?: number; per_page?: number; role?: string; search?: string; sort?: string; order?: string } = {}) {
  return useSuspenseQuery({
    queryKey: queryKeys.user.managed(filters),
    queryFn: () => get<Envelope<ManagedUsersResponse>>('/user/manage/all', filters as Record<string, string | number>).then((r) => r.data),
  })
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => patch<Envelope<ManagedUser>>('/user/profile', input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.user.all })
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (input: { old_password: string; new_password: string }) =>
      patch<Envelope<null>>('/user/password', input),
  })
}

export function useUpdateUserRole(uid: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (role: string) => patch<Envelope<ManagedUser>>(`/user/role/${uid}`, { role }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.user.all })
    },
  })
}

export function useDeleteManagedUser(uid: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => del<Envelope<null>>(`/user/manage/${uid}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.user.managed() })
    },
  })
}

export function useUploadAvatar() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData()
      fd.append('avatar', file)
      return postFormData<Envelope<{ avatar_url: string }>>('/avatar', fd)
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.user.all })
    },
  })
}
