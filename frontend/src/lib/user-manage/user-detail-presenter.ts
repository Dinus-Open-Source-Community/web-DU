import type { UserManageKind } from './page-config'
import type { ManagedUserDetailViewModel, ManagedUserDetailTab } from './user-detail-types'
import { mapManagedUserDetail } from './map-user-detail'
import type { ManagedUserDetailApiResponse } from './user-detail-api-types'

function buildStudentStats(
  enrollmentSummary: ReturnType<typeof mapManagedUserDetail>['enrollmentSummary'],
  reviewSummary: ReturnType<typeof mapManagedUserDetail>['reviewSummary'],
): ManagedUserDetailViewModel['stats'] {
  const totalEnrollments =
    enrollmentSummary.total ??
    (enrollmentSummary.active + enrollmentSummary.completed)

  return [
    { id: 'enrollments', label: 'Total kursus', value: String(totalEnrollments) },
    { id: 'active', label: 'Pendaftaran aktif', value: String(enrollmentSummary.active) },
    { id: 'completed', label: 'Selesai', value: String(enrollmentSummary.completed) },
    { id: 'reviews', label: 'Ulasan diberikan', value: String(reviewSummary.totalReviews) },
  ]
}

function buildMentorStats(
  mentoredCount: number,
  reviewSummary: ReturnType<typeof mapManagedUserDetail>['reviewSummary'],
): ManagedUserDetailViewModel['stats'] {
  return [
    { id: 'courses', label: 'Kursus diajar', value: String(mentoredCount) },
    { id: 'reviews', label: 'Ulasan diterima', value: String(reviewSummary.totalReviews) },
    { id: 'rating', label: 'Rating rata-rata', value: reviewSummary.averageRatingLabel },
  ]
}

function resolveTabs(kind: UserManageKind, mapped: ReturnType<typeof mapManagedUserDetail>): ManagedUserDetailTab[] {
  const tabs: ManagedUserDetailTab[] = ['profile']

  if (kind === 'student' && mapped.joinedCourses.length > 0) {
    tabs.push('courses')
  }

  if (kind === 'mentor' && mapped.mentoredCourses.length > 0) {
    tabs.push('mentored')
  }

  if (mapped.reviews.length > 0) {
    tabs.push('reviews')
  }

  return tabs
}

export function presentManagedUserDetail(
  data: ManagedUserDetailApiResponse,
  kind: UserManageKind,
): ManagedUserDetailViewModel {
  const mapped = mapManagedUserDetail(data)

  const stats =
    kind === 'student'
      ? buildStudentStats(mapped.enrollmentSummary, mapped.reviewSummary)
      : kind === 'mentor'
        ? buildMentorStats(mapped.mentoredCourses.length, mapped.reviewSummary)
        : []

  return {
    profile: mapped.profile,
    stats,
    tabs: resolveTabs(kind, mapped),
    joinedCourses: mapped.joinedCourses,
    mentoredCourses: mapped.mentoredCourses,
    reviews: mapped.reviews,
    reviewSummary: mapped.reviewSummary,
    enrollmentSummary: mapped.enrollmentSummary,
  }
}
