import type { CreateCourseReviewReplyPayload } from '@/lib/course-review/types'
import { parseWithValidationMessage } from '../errors'
import {
  courseReviewReplyParamsSchema,
  createCourseReviewReplyPayloadSchema,
  type CourseReviewReplyParamsValidated,
  type CreateCourseReviewReplyPayloadValidated,
} from '../course-review.schema'

export * from '../course-review.schema'

export function parseCreateCourseReviewReplyPayload(
  payload: CreateCourseReviewReplyPayload,
  fallback = 'Payload balasan review tidak valid',
): CreateCourseReviewReplyPayloadValidated {
  return parseWithValidationMessage(createCourseReviewReplyPayloadSchema, payload, fallback)
}

export function parseCourseReviewReplyParams(
  courseUid: string,
  reviewUid: string,
  fallback = 'Parameter balasan review tidak valid',
): CourseReviewReplyParamsValidated {
  return parseWithValidationMessage(
    courseReviewReplyParamsSchema,
    { courseUid, reviewUid },
    fallback,
  )
}
