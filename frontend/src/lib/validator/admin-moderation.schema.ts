import { z } from 'zod'
import {
  beResolvableUidSchema,
  paginationPageSchema,
  paginationPerPageSchema,
} from './common'
import { courseQaBodySchema } from './course-qa.schema'
import { courseReviewCommentSchema } from './course-review.schema'

export const adminModerationQnaStatusFilterSchema = z.enum(['answered', 'unanswered'], {
  message: 'Status Q&A harus answered atau unanswered',
})

export const adminModerationListParamsSchema = z
  .object({
    page: paginationPageSchema.optional(),
    per_page: paginationPerPageSchema.optional(),
    courseUid: beResolvableUidSchema.optional(),
    rating: z
      .number()
      .int()
      .min(1, 'Rating minimal 1')
      .max(5, 'Rating maksimal 5')
      .optional(),
    has_reply: z.boolean().optional(),
    status: adminModerationQnaStatusFilterSchema.optional(),
  })
  .strict()

/** Payload POST `/admin/reviews/:id/reply` — selaras admin review reply. */
export const adminModerationReviewReplyPayloadSchema = z
  .object({
    comment: courseReviewCommentSchema,
  })
  .strict()

/** Payload POST `/admin/qna/:thread_id/replies`. */
export const adminModerationQnaReplyPayloadSchema = z
  .object({
    body: courseQaBodySchema,
  })
  .strict()

export const adminModerationReviewUidParamSchema = beResolvableUidSchema
export const adminModerationThreadUidParamSchema = beResolvableUidSchema

export type AdminModerationListParamsValidated = z.infer<typeof adminModerationListParamsSchema>
export type AdminModerationReviewReplyPayloadValidated = z.infer<
  typeof adminModerationReviewReplyPayloadSchema
>
export type AdminModerationQnaReplyPayloadValidated = z.infer<typeof adminModerationQnaReplyPayloadSchema>
