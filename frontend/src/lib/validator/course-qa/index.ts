import type { z } from 'zod'
import { parseWithValidationMessage } from '../errors'
import {
  createCourseQaReplyPayloadSchema,
  createCourseQaThreadPayloadSchema,
  courseQaCourseUidParamSchema,
  courseQaThreadUidParamSchema,
  type CreateCourseQaReplyPayloadValidated,
  type CreateCourseQaThreadPayloadValidated,
} from '../course-qa.schema'

export * from '../course-qa.schema'

export function parseCreateCourseQaThreadPayload(
  payload: z.input<typeof createCourseQaThreadPayloadSchema>,
  fallback = 'Data thread Q&A tidak valid',
): CreateCourseQaThreadPayloadValidated {
  return parseWithValidationMessage(createCourseQaThreadPayloadSchema, payload, fallback)
}

export function parseCreateCourseQaReplyPayload(
  payload: z.input<typeof createCourseQaReplyPayloadSchema>,
  fallback = 'Balasan Q&A tidak valid',
): CreateCourseQaReplyPayloadValidated {
  return parseWithValidationMessage(createCourseQaReplyPayloadSchema, payload, fallback)
}

export function parseCourseQaCourseUidParam(uid: string, fallback = 'UID kursus tidak valid'): string {
  return parseWithValidationMessage(courseQaCourseUidParamSchema, uid, fallback)
}

export function parseCourseQaThreadUidParam(uid: string, fallback = 'UID thread tidak valid'): string {
  return parseWithValidationMessage(courseQaThreadUidParamSchema, uid, fallback)
}
