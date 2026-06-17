import type { ValidatorRecordInput } from '../types'
import type { z } from 'zod'
import { parseWithValidationMessage } from '../errors'
import {
  adminModerationListParamsSchema,
  adminModerationQnaReplyPayloadSchema,
  adminModerationReviewReplyPayloadSchema,
  adminModerationReviewUidParamSchema,
  adminModerationThreadUidParamSchema,
  type AdminModerationQnaReplyPayloadValidated,
  type AdminModerationReviewReplyPayloadValidated,
} from '../admin-moderation.schema'

export * from '../admin-moderation.schema'

export function parseAdminModerationListParams(
  params?: ValidatorRecordInput,
  fallback = 'Parameter moderasi tidak valid',
) {
  if (!params) return undefined
  return parseWithValidationMessage(
    adminModerationListParamsSchema,
    params as z.input<typeof adminModerationListParamsSchema>,
    fallback,
  )
}

export function parseAdminModerationReviewReplyPayload(
  payload: z.input<typeof adminModerationReviewReplyPayloadSchema>,
  fallback = 'Balasan review tidak valid',
): AdminModerationReviewReplyPayloadValidated {
  return parseWithValidationMessage(adminModerationReviewReplyPayloadSchema, payload, fallback)
}

export function parseAdminModerationQnaReplyPayload(
  payload: z.input<typeof adminModerationQnaReplyPayloadSchema>,
  fallback = 'Balasan Q&A tidak valid',
): AdminModerationQnaReplyPayloadValidated {
  return parseWithValidationMessage(adminModerationQnaReplyPayloadSchema, payload, fallback)
}

export function parseAdminModerationReviewUidParam(uid: string, fallback = 'UID review tidak valid'): string {
  return parseWithValidationMessage(adminModerationReviewUidParamSchema, uid, fallback)
}

export function parseAdminModerationThreadUidParam(uid: string, fallback = 'UID thread tidak valid'): string {
  return parseWithValidationMessage(adminModerationThreadUidParamSchema, uid, fallback)
}
