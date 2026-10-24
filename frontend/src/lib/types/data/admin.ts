export interface IAdminStudent {
  uid: string
  name: string
  email: string
  avatar: string
  joinedAt: string
  enrolledCourses: number
  averageProgress?: number
  isVerified: boolean
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
  isVerified: boolean
  studentsCount: number
}

export interface IAdminAdministrator {
  uid: string
  name: string
  email: string
  avatar: string
  role: 'Super Admin' | 'Admin'
  isVerified: boolean
  createdAt: string
}

/** Alias backward-compat. */
export type AdminStudent = IAdminStudent
export type AdminMentor = IAdminMentor
export type AdminAdministrator = IAdminAdministrator
