/** Level values accepted by the backend API. */
export type CourseApiLevel = 'PEMULA' | 'MENENGAH' | 'LANJUTAN'

/** Shared multipart fields for create and update course. */
export type CourseFormFields = {
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

/** Kursus baru selalu dibuat sebagai draf; terbitkan lewat PATCH /courses/:id/status. */
export const COURSE_CREATE_AS_DRAFT = false as const

/** Field hanya dikirim saat create — tidak ada di update metadata. */
export type CourseCreateOnlyFields = {
  is_published: typeof COURSE_CREATE_AS_DRAFT
}

export type CreateCoursePayload = CourseFormFields & CourseCreateOnlyFields

/** Update metadata — tanpa is_published; status diubah lewat endpoint terpisah. */
export type UpdateCoursePayload = Partial<CourseFormFields>

/** PATCH /courses/:id/status — tanpa body, hanya course UID. */
export type UpdateCourseStatusRequest = {
  courseUid: string
}

export type CourseFormMode = 'create' | 'edit'

export type CourseFormValues = {
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

export const EMPTY_COURSE_FORM_VALUES: CourseFormValues = {
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
