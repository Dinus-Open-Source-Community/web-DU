import { z } from 'zod'
import { beResolvableUidSchema } from './common'

export const courseReviewCommentSchema = z
  .string({ message: 'Komentar wajib diisi' })
  .trim()
  .min(1, 'Komentar wajib diisi')
  .max(5000, 'Komentar maksimal 5000 karakter')

export const createCourseReviewReplyPayloadSchema = z
  .object({
    comment: courseReviewCommentSchema,
  })
  .strict()

export const courseReviewReplyParamsSchema = z.object({
  courseUid: beResolvableUidSchema,
  reviewUid: beResolvableUidSchema,
})

export type CreateCourseReviewReplyPayloadValidated = z.infer<typeof createCourseReviewReplyPayloadSchema>
export type CourseReviewReplyParamsValidated = z.infer<typeof courseReviewReplyParamsSchema>
