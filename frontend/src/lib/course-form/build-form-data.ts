import { CreateSlug } from '@/lib/func/func'
import {
  COURSE_CREATE_AS_DRAFT,
  type CourseFormFields,
  type CreateCoursePayload,
  type UpdateCoursePayload,
} from './types'

function appendScalar(formData: FormData, key: string, value: string | number | boolean | undefined) {
  if (value === undefined) return
  formData.append(key, String(value))
}

function appendCourseFields(formData: FormData, payload: Partial<CourseFormFields>) {
  if (payload.cover) {
    formData.append('cover', payload.cover)
  }
  appendScalar(formData, 'title', payload.title)
  appendScalar(formData, 'subtitle', payload.subtitle)
  appendScalar(formData, 'description', payload.description)
  appendScalar(formData, 'slug', payload.slug)
  appendScalar(formData, 'category_uid', payload.category_uid)
  appendScalar(formData, 'course_type_uid', payload.course_type_uid)
  appendScalar(formData, 'level', payload.level)
  appendScalar(formData, 'price', payload.price)
  appendScalar(formData, 'price_strike', payload.price_strike)
  appendScalar(formData, 'slot', payload.slot)
  appendScalar(formData, 'is_premium', payload.is_premium)

  if (payload.what_you_learn) {
    formData.append('what_you_learn', JSON.stringify(payload.what_you_learn))
  }
}

export function buildCreateCourseFormData(payload: CreateCoursePayload): FormData {
  const formData = new FormData()
  const slug = payload.slug ?? CreateSlug(payload.title)

  appendCourseFields(formData, { ...payload, slug })
  appendScalar(formData, 'is_published', COURSE_CREATE_AS_DRAFT)

  return formData
}

export function buildUpdateCourseFormData(payload: UpdateCoursePayload): FormData {
  const formData = new FormData()
  // is_published sengaja tidak dikirim — gunakan PATCH /courses/:id/status
  appendCourseFields(formData, payload)
  return formData
}
