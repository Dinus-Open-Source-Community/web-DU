import type { AssignMentorsToCoursePayload } from '@/lib/course-mentor/types'
import { parseWithValidationMessage } from '../errors'
import {
  assignMentorsCourseUidParamSchema,
  assignMentorsToCoursePayloadSchema,
  type AssignMentorsToCoursePayloadValidated,
} from '../course-mentor.schema'

export * from '../course-mentor.schema'

export function parseAssignMentorsToCoursePayload(
  payload: AssignMentorsToCoursePayload,
  fallback = 'Payload penugasan mentor tidak valid',
): AssignMentorsToCoursePayloadValidated {
  return parseWithValidationMessage(assignMentorsToCoursePayloadSchema, payload, fallback)
}

export function parseAssignMentorsCourseUidParam(
  courseUid: string,
  fallback = 'UID kursus tidak valid',
): string {
  return parseWithValidationMessage(assignMentorsCourseUidParamSchema, courseUid, fallback)
}
