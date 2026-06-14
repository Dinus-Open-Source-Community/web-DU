import type {
  CourseMasterFormValues,
  CreateCourseMasterPayload,
  UpdateCourseMasterPayload,
} from '@/lib/course-master/types'
import { getValidationMessage, parseWithValidationMessage } from '../errors'
import {
  courseMasterFormValuesSchema,
  courseMasterUidParamSchema,
  createCourseMasterPayloadSchema,
  updateCourseMasterPayloadSchema,
  type CourseMasterFormValuesValidated,
  type CreateCourseMasterPayloadValidated,
  type UpdateCourseMasterPayloadValidated,
} from '../course-master.schema'

export * from '../course-master.schema'

export function parseCreateCourseMasterPayload(
  payload: CreateCourseMasterPayload,
  fallback = 'Payload pembuatan data master tidak valid',
): CreateCourseMasterPayloadValidated {
  return parseWithValidationMessage(createCourseMasterPayloadSchema, payload, fallback)
}

export function parseUpdateCourseMasterPayload(
  payload: UpdateCourseMasterPayload,
  fallback = 'Payload pembaruan data master tidak valid',
): UpdateCourseMasterPayloadValidated {
  return parseWithValidationMessage(updateCourseMasterPayloadSchema, payload, fallback)
}

export function parseCourseMasterFormValues(
  values: CourseMasterFormValues,
  fallback = 'Form data master tidak valid',
): CourseMasterFormValuesValidated {
  return parseWithValidationMessage(courseMasterFormValuesSchema, values, fallback)
}

export function parseCourseMasterUidParam(uid: string, fallback = 'UID data master tidak valid'): string {
  return parseWithValidationMessage(courseMasterUidParamSchema, uid, fallback)
}

export function getCourseMasterFormValidationMessage(values: CourseMasterFormValues): string | null {
  const result = courseMasterFormValuesSchema.safeParse(values)
  if (!result.success) return getValidationMessage(result.error)
  return null
}
