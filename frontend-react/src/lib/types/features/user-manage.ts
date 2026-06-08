import type { UserRole } from '../common/domain'

export type AssignableUserRole = Extract<UserRole, 'admin' | 'mentor' | 'student'>

export const ASSIGNABLE_USER_ROLES: AssignableUserRole[] = ['student', 'mentor', 'admin']

export interface IManagedUserListParams {
  page?: number
  per_page?: number
  role?: AssignableUserRole | 'super_admin'
  search?: string
  sort?: 'created_at' | 'name'
  order?: 'asc' | 'desc'
}

export interface IManagedEnrollmentItem {
  uid: string
  progress?: number
  status?: string
  enrolled_at?: string
  course_uid?: string
}

export interface IManagedUserItem {
  uid: string
  name: string
  email: string
  avatar_url?: string
  role: string
  is_verified: boolean
  enrollments?: IManagedEnrollmentItem[]
  created_at: string
  updated_at: string
}

export interface IManagedUsersListResponse {
  users: IManagedUserItem[]
  meta: {
    current_page: number
    per_page: number
    total: number
    total_pages: number
  }
}

export interface IUpdateUserRolePayload {
  role: AssignableUserRole
}

/** Alias backward-compat. */
export type ManagedUserListParams = IManagedUserListParams
export type ManagedEnrollmentItem = IManagedEnrollmentItem
export type ManagedUserItem = IManagedUserItem
export type ManagedUsersListResponse = IManagedUsersListResponse
export type UpdateUserRolePayload = IUpdateUserRolePayload
