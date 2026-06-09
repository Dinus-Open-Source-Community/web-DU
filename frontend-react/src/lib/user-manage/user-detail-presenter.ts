import type { UserManageKind } from './page-config'
import type { ManagedUserDetailViewModel, ManagedUserDetailTab } from './user-detail-types'
import { mapManagedUserDetail } from './map-user-detail'
import type { ManagedUserDetailApiResponse } from './user-detail-api-types'

function buildStudentStats(
  enrollmentSummary: ReturnType<typeof mapManagedUserDetail>['enrollmentSummary'],
  reviewSummary: ReturnType<typeof mapManagedUserDetail>['reviewSummary'],
  transactionCount: number,
): ManagedUserDetailViewModel['stats'] {
  const totalEnrollments =
    enrollmentSummary.pending +
    enrollmentSummary.active +
    enrollmentSummary.completed +
    enrollmentSummary.cancelled

  return [
    { id: 'enrollments', label: 'Total kursus', value: String(totalEnrollments) },
    { id: 'active', label: 'Enrollment aktif', value: String(enrollmentSummary.active) },
    { id: 'completed', label: 'Selesai', value: String(enrollmentSummary.completed) },
    { id: 'transactions', label: 'Transaksi', value: String(transactionCount) },
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

function buildAdminStats(profile: ReturnType<typeof mapManagedUserDetail>['profile']): ManagedUserDetailViewModel['stats'] {
  return [
    { id: 'joined', label: 'Bergabung sejak', value: profile.createdAtLabel },
    { id: 'updated', label: 'Terakhir diperbarui', value: profile.updatedAtLabel },
    { id: 'role', label: 'Role saat ini', value: profile.roleLabel },
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

  if (kind === 'student' && mapped.transactions.length > 0) {
    tabs.push('transactions')
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
      ? buildStudentStats(mapped.enrollmentSummary, mapped.reviewSummary, mapped.transactions.length)
      : kind === 'mentor'
        ? buildMentorStats(mapped.mentoredCourses.length, mapped.reviewSummary)
        : buildAdminStats(mapped.profile)

  return {
    profile: mapped.profile,
    stats,
    tabs: resolveTabs(kind, mapped),
    joinedCourses: mapped.joinedCourses,
    mentoredCourses: mapped.mentoredCourses,
    reviews: mapped.reviews,
    reviewSummary: mapped.reviewSummary,
    enrollmentSummary: mapped.enrollmentSummary,
    transactions: mapped.transactions,
  }
}
