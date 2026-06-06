import type {
  CourseFormValues,
  CreateCoursePayload,
  UpdateCoursePayload,
  UpdateCourseStatusRequest,
} from '@/lib/course-form/types'
import { getValidationMessage, parseWithValidationMessage } from '../errors'
import {
  courseFormValuesSchema,
  courseUidParamSchema,
  createCoursePayloadSchema,
  updateCoursePayloadSchema,
  updateCourseStatusRequestSchema,
  type CourseFormValuesValidated,
  type CreateCoursePayloadValidated,
  type UpdateCoursePayloadValidated,
  type UpdateCourseStatusRequestValidated,
} from '../course-form.schema'

export * from '../course-form.schema'

export function parseCreateCoursePayload(
  payload: CreateCoursePayload,
  fallback = 'Payload pembuatan kursus tidak valid',
): CreateCoursePayloadValidated {
  return parseWithValidationMessage(createCoursePayloadSchema, payload, fallback)
}

export function parseUpdateCoursePayload(
  payload: UpdateCoursePayload,
  fallback = 'Payload pembaruan kursus tidak valid',
): UpdateCoursePayloadValidated {
  return parseWithValidationMessage(updateCoursePayloadSchema, payload, fallback)
}

export function parseUpdateCourseStatusRequest(
  request: UpdateCourseStatusRequest,
  fallback = 'Permintaan pembaruan status kursus tidak valid',
): UpdateCourseStatusRequestValidated {
  return parseWithValidationMessage(updateCourseStatusRequestSchema, request, fallback)
}

export function parseCourseFormValues(
  values: CourseFormValues,
  fallback = 'Form kursus tidak valid',
): CourseFormValuesValidated {
  return parseWithValidationMessage(courseFormValuesSchema, values, fallback)
}

export function parseCourseUidParam(uid: string, fallback = 'UID kursus tidak valid'): string {
  return parseWithValidationMessage(courseUidParamSchema, uid, fallback)
}

export function getCourseFormValidationMessage(values: CourseFormValues): string | null {
  const result = courseFormValuesSchema.safeParse(values)
  if (!result.success) return getValidationMessage(result.error)
  return null
}
