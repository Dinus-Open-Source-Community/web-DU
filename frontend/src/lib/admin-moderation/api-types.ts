import type { IPaginationMeta } from '@/lib/types/common/pagination'

export type AdminModerationReviewReplyRaw = {
  author?: string
  comment?: string
  createdAt?: string | Date
}

export type AdminReviewRaw = {
  uid?: string
  courseUid?: string
  studentUid?: string
  courseTitle?: string
  studentName?: string
  studentAvatar?: string
  comment?: string
  rating?: number | string
  createdAt?: string | Date
  reply?: AdminModerationReviewReplyRaw
}

export type AdminQaReplyRaw = {
  uid?: string
  body?: string
  author?: string
  authorAvatar?: string
  role?: string
  createdAt?: string | Date
}

export type AdminQaThreadRaw = {
  uid?: string
  courseUid?: string
  authorUid?: string
  courseTitle?: string
  title?: string
  author?: string
  authorAvatar?: string
  body?: string
  createdAt?: string | Date
  repliesCount?: number
  status?: string
  replies?: AdminQaReplyRaw[]
}

export type AdminModerationListData = {
  reviews?: AdminReviewRaw[]
  threads?: AdminQaThreadRaw[]
  meta?: Partial<IPaginationMeta>
}

export type AdminModerationActionResponse = {
  success?: boolean
  message?: string
}
