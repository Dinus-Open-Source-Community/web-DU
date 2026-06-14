import type { CourseApiLevel } from '../common/domain'

export type { CourseApiLevel }

export interface ICourseFormFields {
  title: string
  subtitle: string
  slug?: string
  description: string
  category_uid: string
  course_type_uid: string
  level: CourseApiLevel
  price: number
  price_strike?: number
  what_you_learn: string[]
  slot?: number
  is_premium?: boolean
  cover?: File
}

/** Kursus baru dibuat sebagai draf; terbitkan lewat PATCH /courses/:id/status. */
export const COURSE_CREATE_AS_DRAFT = false as const

export interface ICourseCreateOnlyFields {
  is_published: typeof COURSE_CREATE_AS_DRAFT
}

export type ICreateCoursePayload = ICourseFormFields & ICourseCreateOnlyFields
export type IUpdateCoursePayload = Partial<ICourseFormFields>

export interface IUpdateCourseStatusRequest {
  courseUid: string
}

export type CourseFormMode = 'create' | 'edit'

export interface ICourseFormValues {
  title: string
  subtitle: string
  description: string
  categoryUid: string
  courseTypeUid: string
  level: CourseApiLevel
  price: number | ''
  strikePrice: number | ''
  whatYouLearn: string[]
  slot: number | ''
  coverFile: File | null
  coverPreviewUrl?: string
}

export const EMPTY_COURSE_FORM_VALUES: ICourseFormValues = {
  title: '',
  subtitle: '',
  description: '',
  categoryUid: '',
  courseTypeUid: '',
  level: 'PEMULA',
  price: '',
  strikePrice: '',
  whatYouLearn: [],
  slot: '',
  coverFile: null,
  coverPreviewUrl: undefined,
}

/** Alias backward-compat. */
export type CourseFormFields = ICourseFormFields
export type CourseCreateOnlyFields = ICourseCreateOnlyFields
export type CreateCoursePayload = ICreateCoursePayload
export type UpdateCoursePayload = IUpdateCoursePayload
export type UpdateCourseStatusRequest = IUpdateCourseStatusRequest
export type CourseFormValues = ICourseFormValues
