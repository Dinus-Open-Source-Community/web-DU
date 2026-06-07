import type { CourseDetailLesson, LessonDetailItem } from './lesson'

// =====================
// Module API
// =====================

export interface IModulesDetail {
  uid: string
  course_uid: string
  title: string
  order_index: number
  created_at: string
  /** Diisi via GET `/lessons?module_uid=` — tidak lagi nested di response modul. */
  lessons?: LessonDetailItem[]
}

export interface ICourseDetailModule {
  course_uid: string
  created_at: string
  /** Diisi via GET `/lessons?module_uid=` — tidak lagi nested di response modul. */
  lessons?: CourseDetailLesson[]
  order_index: number
  title: string
  uid: string
  updated_at?: string
}

/** Alias untuk komponen editor kurikulum. */
export type IModulesData = ICourseDetailModule

export interface IModulesByCourseUidResponse {
  modules: ICourseDetailModule[]
  meta: {
    current_page: number
    per_page: number
    total: number
    total_pages: number
  }
}
