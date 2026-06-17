import type { AdminQaThread, AdminReview } from '@/lib/types/course'
import type { IPaginationMeta } from '@/lib/types/common/pagination'

export type AdminReviewsListResponse = {
  reviews: AdminReview[]
  meta: IPaginationMeta
}

export type AdminQnaListResponse = {
  threads: AdminQaThread[]
  meta: IPaginationMeta
}

export type AdminModerationReviewReplyPayload = {
  comment: string
}

export type AdminModerationQnaReplyPayload = {
  body: string
}
