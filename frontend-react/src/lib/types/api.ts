import type { ReactNode } from 'react'
import type { AdminStatus } from './user'

// =====================
// Base Responses
// =====================
export interface IResponse<T> {
  success?: boolean
  message?: string
  data?: T
  error?: string
}

// =====================
// Courses
// =====================
// type untuk course
export interface CourseMentorItem {
  avatar_url: string
  created_at: string
  description: string
  email: string
  is_verified: boolean
  name: string
  role: string
  uid: string
  updated_at: string
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

// =====================
// Course Items
// =====================
// interface untuk data course
export interface ICourseItem {
  category_uid: string
  course_type_uid: string
  cover_url: string
  created_at: string
  description: string
  event_uid: string | null
  is_premium: boolean
  is_published: boolean
  level: string
  mentor_uid: string
  mentors: CourseMentorItem[]
  price: number
  price_strike: number
  slot: number
  slug: string
  status: string
  subtitle: string
  thumbnail_url: string
  title: string
  uid: string
  updated_at: string
  what_you_learn: string[]
}

// =====================
// Categories & Course Types
// =====================
// type untuk category
export type CategoryItem = {
  uid: string
  name: string
  description: string
  is_active: boolean
  courses?: ICourseItem[]
  created_at: string
  updated_at: string
}

// type untuk course type
export type CourseTypeItem = {
  uid: string
  name: string
  description: string
  is_active: boolean
  courses?: ICourseItem[]
  created_at: string
  updated_at: string
}

// =====================
// List Responses
// =====================
// type untuk response course
export type CourseListResponse = {
  courses: ICourseItem[]
  meta: {
    current_page: number
    per_page: number
    total: number
    total_pages: number
  }
}

// type untuk response category
export type CategoryListResponse = {
  course_categories: CategoryItem[]
  meta: {
    current_page: number
    per_page: number
    total: number
    total_pages: number
  }
}

// type untuk response course type
export type CourseTypeListResponse = {
  course_types: CourseTypeItem[]
  meta: {
    current_page: number
    per_page: number
    total: number
    total_pages: number
  }
}

// =====================
// Course Detail
// =====================
// type untuk course detail
export interface CourseDetailMentor {
  avatar_url: string
  created_at: string
  description: string
  email: string
  is_verified: boolean
  name: string
  role: string
  uid: string
  updated_at: string
}

export interface CourseDetailLesson {
  created_at: string
  module_uid: string
  title: string
  content_type?: 'text' | 'video'
  content?: {
    intro: string
    summary: string
    learning: string
  }
  video_url?: string
  start_time?: string
  end_time?: string
  order_index: number
  uid: string
  updated_at: string
}

// =====================
// Lesson Detail
// =====================
// type untuk lesson detail
export interface LessonDetailContent {
  intro: string
  summary: string
  learning: string
}

export interface LessonDetailItem {
  uid: string
  module_uid: string
  title: string
  content_type: 'text' | 'video'
  content: LessonDetailContent
  video_url: string
  start_time: string
  end_time: string
  order_index: number
  created_at: string
  updated_at: string
}

export type LessonDetailListResponse = {
  lessons: LessonDetailItem[]
  meta: {
    current_page: number
    per_page: number
    total: number
    total_pages: number
  }
}

// =====================
// Modules Detail
// =====================
export interface IModulesDetail {
  uid: string
  course_uid: string
  title: string
  order_index: number
  created_at: string
  lessons: LessonDetailItem[]
}

// =====================
// Modules Summary
// =====================
export interface CourseDetailModule {
  course_uid: string
  created_at: string
  lessons: CourseDetailLesson[]
  order_index: number
  title: string
  uid: string
  updated_at?: string
}

export interface IModulesData {
  uid: string
  course_uid: string
  title: string
  order_index: number
  created_at: string
  lessons: CourseDetailLesson[]
}

// =====================
// Course Detail Item
// =====================
export interface CourseDetailItem {
  category: CategoryItem
  course_type: CourseTypeItem
  cover_url: string
  created_at: string
  description: string
  event_uid: string | null
  is_premium: boolean
  is_published: boolean
  level: string
  mentors: CourseDetailMentor[]
  modules: CourseDetailModule[]
  price: number
  price_strike: number
  slot: number
  slug: string
  status: string
  subtitle: string
  thumbnail_url: string
  title: string
  uid: string
  updated_at: string
  what_you_learn: string[]
}
