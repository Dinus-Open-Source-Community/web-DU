import type { z } from 'zod'
import type { CreateCourseReviewReplyPayload } from '@/lib/course-review/types'
import { parseWithValidationMessage } from '../errors'
import {
  courseReviewReplyParamsSchema,
  createCourseReviewPayloadSchema,
  createCourseReviewReplyPayloadSchema,
  type CourseReviewReplyParamsValidated,
  type CreateCourseReviewPayloadValidated,
  type CreateCourseReviewReplyPayloadValidated,
} from '../course-review.schema'

export * from '../course-review.schema'

export function parseCreateCourseReviewPayload(
  payload: z.input<typeof createCourseReviewPayloadSchema>,
  fallback = 'Data review tidak valid',
): CreateCourseReviewPayloadValidated {
  return parseWithValidationMessage(createCourseReviewPayloadSchema, payload, fallback)
}

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
