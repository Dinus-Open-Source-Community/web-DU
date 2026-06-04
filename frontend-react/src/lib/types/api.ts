import type { ReactNode } from 'react'
import type { AdminStatus } from './user'

// =====================
// Base Responses
// =====================
export interface IResponse<T> {
  success?: boolean
  message?: string
  data?: T | null
  error?: string | null
}

// =====================
// Admin - Mentor
// =====================
// intraface untuk data mentor
export interface AdminMentor {
  uid: string
  name: string
  email: string
  avatar: string
  joinedAt: string
  totalCourses: number
  rating: number
  totalReviews: number
  status: AdminStatus
  // specializations: MentorSpecialization[]
  bio?: string
  studentsCount: number
}

export interface AdminDataTableColumn<T> {
  id: string
  header: ReactNode
  cell: (row: T) => ReactNode
  align?: 'left' | 'center' | 'right'
  className?: string
  headerClassName?: string
}

export interface AdminDataTableProps<T> {
  columns: AdminDataTableColumn<T>[]
  data: T[]
  keyField: (row: T) => string
  toolbar?: ReactNode
  page?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  emptyState?: ReactNode
  tableClassName?: string
  wrapperClassName?: string
  compact?: boolean
  onRowClick?: (row: T) => void
}

// =====================
// Admin - Administrator
// =====================
// interface untuk data administrator
export interface AdminAdministrator {
  uid: string
  name: string
  email: string
  avatar: string
  role: 'Super Admin' | 'Admin' | 'Finance' | 'Content Moderator' | 'Support'
  lastActive: string
  status: AdminStatus
  createdAt: string
}
