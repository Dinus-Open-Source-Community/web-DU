import type { AdminAdministrator, AdminMentor } from '@/lib/types/api'
import type { AdminStudent } from '@/lib/types/user'
import type { ManagedUserItem } from './types'
import { toLearningProgressPercent } from '@/lib/learning/progress'

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

function formatDate(value?: string) {
  if (!value) return '-'
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? value : dateFormatter.format(parsed)
}

function averageProgress(enrollments?: ManagedUserItem['enrollments']) {
  if (!enrollments?.length) return 0
  const total = enrollments.reduce(
    (sum, item) => sum + toLearningProgressPercent(item.progress),
    0,
  )
  return Math.round((total / enrollments.length) * 100) / 100
}

function mapAdministratorRole(role: string): AdminAdministrator['role'] {
  if (role === 'super_admin') return 'Super Admin'
  return 'Admin'
}

export function toAdminStudent(user: ManagedUserItem): AdminStudent {
  const count = user.enrollments?.length ?? 0
  return {
    uid: user.uid,
    name: user.name,
    email: user.email,
    avatar: user.avatar_url || '',
    joinedAt: formatDate(user.created_at),
    enrolledCourses: count,
    averageProgress: count > 0 ? averageProgress(user.enrollments) : undefined,
    isVerified: user.is_verified,
  }
}

export function toAdminMentor(user: ManagedUserItem): AdminMentor {
  return {
    uid: user.uid,
    name: user.name,
    email: user.email,
    avatar: user.avatar_url || '',
    joinedAt: formatDate(user.created_at),
    totalCourses: 0,
    rating: 0,
    totalReviews: 0,
    isVerified: user.is_verified,
    studentsCount: 0,
  }
}

export function toAdminAdministrator(user: ManagedUserItem): AdminAdministrator {
  return {
    uid: user.uid,
    name: user.name,
    email: user.email,
    avatar: user.avatar_url || '',
    role: mapAdministratorRole(user.role),
    isVerified: user.is_verified,
    createdAt: formatDate(user.created_at),
  }
}

export function mapManagedUsers(
  users: ManagedUserItem[],
  mapper: (user: ManagedUserItem) => AdminStudent,
): AdminStudent[]

export function mapManagedUsers(
  users: ManagedUserItem[],
  mapper: (user: ManagedUserItem) => AdminMentor,
): AdminMentor[]

export function mapManagedUsers(
  users: ManagedUserItem[],
  mapper: (user: ManagedUserItem) => AdminAdministrator,
): AdminAdministrator[]

export function mapManagedUsers<T>(
  users: ManagedUserItem[],
  mapper: (user: ManagedUserItem) => T,
): T[] {
  return users.map(mapper)
}
