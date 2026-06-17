import type { ValidatorRecordInput } from '../types'
import type { z } from 'zod'
import { parseWithValidationMessage } from '../errors'
import {
  courseListParamsSchema,
  genericPaginationParamsSchema,
  joinCourseUidParamSchema,
  type GenericPaginationParamsValidated,
} from '../query.schema'

export * from '../query.schema'

export function parseCourseListParams(
  params?: ValidatorRecordInput,
  fallback = 'Parameter daftar kursus tidak valid',
) {
  if (!params) return undefined
  return parseWithValidationMessage(
    courseListParamsSchema,
    params as z.input<typeof courseListParamsSchema>,
    fallback,
  )
}

export function parseGenericPaginationParams(
  params?: GenericPaginationParamsValidated,
  fallback = 'Parameter pagination tidak valid',
) {
  if (!params) return undefined
  return parseWithValidationMessage(genericPaginationParamsSchema, params, fallback)
}

export function parseJoinCourseUidParam(uid: string, fallback = 'UID kursus tidak valid'): string {
  return parseWithValidationMessage(joinCourseUidParamSchema, uid, fallback)
}
