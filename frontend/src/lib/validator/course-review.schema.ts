import { z } from 'zod'
import { beResolvableUidSchema } from './common'

export const courseReviewRatingSchema = z
  .number({ message: 'Rating wajib diisi' })
  .int('Rating harus bilangan bulat')
  .min(1, 'Rating minimal 1')
  .max(5, 'Rating maksimal 5')

export const courseReviewCommentSchema = z
  .string({ message: 'Komentar wajib diisi' })
  .trim()
  .min(1, 'Komentar wajib diisi')
  .max(5000, 'Komentar maksimal 5000 karakter')

/** Payload POST `/courses/:uid/review` — selaras `dto.CreateCourseReviewRequest`. */
export const createCourseReviewPayloadSchema = z
  .object({
    rating: courseReviewRatingSchema,
    comment: courseReviewCommentSchema,
  })
  .strict()

/** Payload POST `/courses/:courseUid/review/:reviewUid/reply` & admin reply. */
export const createCourseReviewReplyPayloadSchema = z
  .object({
    comment: courseReviewCommentSchema,
  })
  .strict()

export const courseReviewReplyParamsSchema = z.object({
  courseUid: beResolvableUidSchema,
  reviewUid: beResolvableUidSchema,
})

export type CreateCourseReviewPayloadValidated = z.infer<typeof createCourseReviewPayloadSchema>
export type CreateCourseReviewReplyPayloadValidated = z.infer<typeof createCourseReviewReplyPayloadSchema>
export type CourseReviewReplyParamsValidated = z.infer<typeof courseReviewReplyParamsSchema>
