import type {
  CourseDetailReview,
  CourseDetailReviewReply,
  CourseDetailReviewUser,
  ICourseDetailItem,
} from '@/lib/types/course'
import type { CourseReviewReplyApiItem } from './types'

type ReviewReplyAuthorSource = {
  user?: CourseDetailReviewUser | null
  replier?: CourseDetailReviewUser | null
}

function resolveReviewAuthor(source: ReviewReplyAuthorSource | null | undefined): CourseDetailReviewUser {
  const author = source?.user ?? source?.replier
  return {
    uid: author?.uid ?? '',
    name: author?.name ?? 'Pengguna',
    avatar_url: author?.avatar_url ?? '',
  }
}

export function mapCourseReviewReply(
  reply: CourseDetailReviewReply | CourseReviewReplyApiItem,
): CourseDetailReviewReply {
  return {
    uid: reply.uid,
    comment: reply.comment,
    created_at: reply.created_at,
    rating: 'rating' in reply ? (reply.rating ?? 0) : 0,
    user: resolveReviewAuthor(reply),
  }
}

export function normalizeCourseDetailReviews(reviews: CourseDetailReview[] | undefined): CourseDetailReview[] {
  if (!reviews?.length) return []

  return reviews.map((review) => ({
    ...review,
    user: resolveReviewAuthor(review),
    replies: (review.replies ?? []).map((reply) => mapCourseReviewReply(reply)),
  }))
}

export function normalizeCourseDetailItem(course: ICourseDetailItem): ICourseDetailItem {
  return {
    ...course,
    reviews: normalizeCourseDetailReviews(course.reviews),
  }
}
