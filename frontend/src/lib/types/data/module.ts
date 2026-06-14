import type { ILessonDetailItem, ILessonResponse } from './lesson'

export interface IModuleDetail {
  uid: string
  course_uid: string
  title: string
  order_index: number
  created_at: string
  lessons?: ILessonDetailItem[]
}

export interface ICourseDetailModule {
  course_uid: string
  created_at: string
  lessons?: ILessonResponse[]
  order_index: number
  title: string
  uid: string
  updated_at?: string
}

export interface IModulesByCourseUidResponse {
  modules: ICourseDetailModule[]
  meta: {
    current_page: number
    per_page: number
    total: number
    total_pages: number
  }
}

/** Alias backward-compat. */
export type IModulesDetail = IModuleDetail
export type IModulesData = ICourseDetailModule
