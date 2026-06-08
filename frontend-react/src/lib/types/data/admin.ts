import type { AdminStatus } from '../common/domain'

export interface IAdminStudent {
  uid: string
  name: string
  email: string
  avatar: string
  joinedAt: string
  enrolledCourses: number
  averageProgress: number
  status: AdminStatus
  totalSpent: number
  phone?: string
  lastActive: string
}

export interface IAdminMentor {
  uid: string
  name: string
  email: string
  avatar: string
  joinedAt: string
  totalCourses: number
  rating: number
  totalReviews: number
  status: AdminStatus
  bio?: string
  studentsCount: number
}

export interface IAdminAdministrator {
  uid: string
  name: string
  email: string
  avatar: string
  role: 'Super Admin' | 'Admin' | 'Finance' | 'Content Moderator' | 'Support'
  lastActive: string
  status: AdminStatus
  createdAt: string
}

/** Alias backward-compat. */
export type AdminStudent = IAdminStudent
export type AdminMentor = IAdminMentor
export type AdminAdministrator = IAdminAdministrator
