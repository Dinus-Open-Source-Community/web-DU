import type { UserRole } from '@/lib/types/user'

export type AssignableUserRole = Extract<UserRole, 'admin' | 'mentor' | 'student'>

export const ASSIGNABLE_USER_ROLES: AssignableUserRole[] = ['student', 'mentor', 'admin']

export type ManagedUserListParams = {
  page?: number
  per_page?: number
  role?: AssignableUserRole | 'super_admin'
  search?: string
  sort?: 'created_at' | 'name'
  order?: 'asc' | 'desc'
}

export type ManagedEnrollmentItem = {
  uid: string
  progress?: number
  status?: string
  enrolled_at?: string
  course_uid?: string
}

export type ManagedUserItem = {
  uid: string
  name: string
  email: string
  avatar_url?: string
  role: string
  is_verified: boolean
  enrollments?: ManagedEnrollmentItem[]
  created_at: string
  updated_at: string
}

export type ManagedUsersListResponse = {
  users: ManagedUserItem[]
  meta: {
    current_page: number
    per_page: number
    total: number
    total_pages: number
  }
}

/** PATCH /user/role/:id */
export type UpdateUserRolePayload = {
  role: AssignableUserRole
}
