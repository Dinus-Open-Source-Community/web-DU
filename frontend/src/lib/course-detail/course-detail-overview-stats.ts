import type { CourseAssignmentBulkItem } from '@/lib/course-detail/assignment-overview-types'
import type { ICourseDetailReview, IModulesData } from '@/lib/types/course'

/** Label KPI jumlah ulasan — tab Ringkasan detail kursus (semua role staff). */
export const COURSE_DETAIL_OVERVIEW_REVIEW_KPI_LABEL = 'Ulasan'

export function countCurriculumLessons(modules: readonly IModulesData[]): number {
  return modules.reduce((total, module) => total + (module.lessons?.length ?? 0), 0)
}

export type CourseDetailReviewSummary = {
  count: number
  averageRating: number
  latestReview: ICourseDetailReview | null
  pendingReplyCount: number
}

export function summarizeCourseReviews(reviews: readonly ICourseDetailReview[]): CourseDetailReviewSummary {
  const count = reviews.length
  if (count === 0) {
    return { count: 0, averageRating: 0, latestReview: null, pendingReplyCount: 0 }
  }

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / count
  const sorted = [...reviews].sort(
    (left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime(),
  )
  const pendingReplyCount = reviews.filter((review) => (review.replies?.length ?? 0) === 0).length

  return {
    count,
    averageRating,
    latestReview: sorted[0] ?? null,
    pendingReplyCount,
  }
}

export function summarizeAssignments(
  assignments: readonly CourseAssignmentBulkItem[],
  studentCount: number,
) {
  const totalSubmissions = assignments.reduce((sum, item) => sum + item.submissionCount, 0)
  const maxPossible = assignments.length * Math.max(studentCount, 0)

  return {
    assignmentCount: assignments.length,
    totalSubmissions,
    completionRate: maxPossible > 0 ? Math.round((totalSubmissions / maxPossible) * 100) : 0,
  }
}
