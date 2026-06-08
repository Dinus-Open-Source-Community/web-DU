import type { ICourseReviewUser } from '../data/course'

export interface ICreateCourseReviewReplyPayload {
  comment: string
}

export interface ICourseReviewReplyApiItem {
  uid: string
  comment: string
  created_at: string
  course_review_uid?: string
  replier_uid?: string
  replier?: ICourseReviewUser | null
}

export type ICreateCourseReviewReplyResponse = ICourseReviewReplyApiItem

/** Alias backward-compat. */
export type CreateCourseReviewReplyPayload = ICreateCourseReviewReplyPayload
export type CourseReviewReplyApiItem = ICourseReviewReplyApiItem
export type CreateCourseReviewReplyResponse = ICreateCourseReviewReplyResponse
