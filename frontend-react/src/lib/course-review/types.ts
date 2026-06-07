import type { CourseDetailReviewUser } from '@/lib/types/course'

/** POST /courses/:courseUid/review/:reviewUid/reply */
export type CreateCourseReviewReplyPayload = {
  comment: string
}

/** Bentuk reply dari BE saat create (201) atau di list review detail. */
export type CourseReviewReplyApiItem = {
  uid: string
  comment: string
  created_at: string
  course_review_uid?: string
  replier_uid?: string
  /** Field di response list review detail kursus. */
  replier?: CourseDetailReviewUser | null
}

export type CreateCourseReviewReplyResponse = CourseReviewReplyApiItem
