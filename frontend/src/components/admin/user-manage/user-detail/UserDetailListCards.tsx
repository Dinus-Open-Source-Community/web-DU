import { Link } from 'react-router-dom'
import { ExternalLink, Star } from 'lucide-react'

import { formatCourseRatingLabel } from '@/lib/course-detail/course-rating'
import { UserDetailProgressBar } from '@/components/admin/user-manage/user-detail/UserDetailProgressBar'
import { PaymentBadge } from '@/components/ui/badge'
import { AdminPublishStatusLabel, AdminStatusLabel } from '@/lib/admin/status-label'
import { Button } from '@/components/ui/button'
import { userDetailLayout } from '@/lib/user-manage/user-detail-layout'
import type {
  ManagedUserDetailJoinedCourse,
  ManagedUserDetailMentoredCourse,
  ManagedUserDetailReview,
  ManagedUserDetailTransaction,
} from '@/lib/user-manage/user-detail-types'

export function UserDetailJoinedCourseCard({ course }: { course: ManagedUserDetailJoinedCourse }) {
  return (
    <article className={userDetailLayout.card}>
      <div className={`${userDetailLayout.cardPadding} flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between`}>
        <div className="min-w-0 space-y-3">
          <div className="space-y-1">
            <h3 className={userDetailLayout.cardTitle}>{course.title}</h3>
            {course.subtitle ? (
              <p className={userDetailLayout.cardSubtitle}>{course.subtitle}</p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <AdminStatusLabel tone="info">{course.enrollmentStatusLabel}</AdminStatusLabel>
            <span className="text-line-medium">·</span>
            <span className={userDetailLayout.metaChip}>Terdaftar {course.enrolledAtLabel}</span>
          </div>

          <UserDetailProgressBar label={course.progressLabel} percent={course.progressPercent} />
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className={userDetailLayout.actionButton}
          asChild
        >
          <Link to={course.adminCourseHref}>
            <ExternalLink className="mr-1.5 size-3.5" aria-hidden />
            Lihat kursus
          </Link>
        </Button>
      </div>

      {course.assignments.length > 0 ? (
        <div className={userDetailLayout.nestedSection}>
          <p className={userDetailLayout.nestedSectionTitle}>
            Pengumpulan tugas ({course.assignments.length})
          </p>
          <ul className="space-y-2">
            {course.assignments.slice(0, 3).map((assignment) => (
              <li key={assignment.submissionUid} className={userDetailLayout.nestedRow}>
                <div className="min-w-0">
                  <p className={userDetailLayout.nestedRowTitle}>{assignment.assignmentTitle}</p>
                  <p className={userDetailLayout.nestedRowMeta}>
                    {assignment.moduleTitle} · {assignment.lessonTitle}
                  </p>
                </div>
                <p className={userDetailLayout.nestedRowValue}>
                  {assignment.scorePercent != null
                    ? `${assignment.scorePercent}%`
                    : 'Belum dinilai'}{' '}
                  · {assignment.submittedAtLabel}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  )
}

export function UserDetailMentoredCourseCard({ course }: { course: ManagedUserDetailMentoredCourse }) {
  return (
    <article className={userDetailLayout.card}>
      <div className={`${userDetailLayout.cardPadding} flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between`}>
        <div className="min-w-0 space-y-3">
          <div className="space-y-1">
            <h3 className={userDetailLayout.cardTitle}>{course.title}</h3>
            {course.subtitle ? (
              <p className={userDetailLayout.cardSubtitle}>{course.subtitle}</p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <AdminPublishStatusLabel published={course.isPublished} />
            <span className="text-line-medium">·</span>
            <span className={userDetailLayout.metaChip}>{course.priceLabel}</span>
            <span className="text-line-medium">·</span>
            <span className={userDetailLayout.metaChip}>Dibuat {course.createdAtLabel}</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className={userDetailLayout.actionButton}
          asChild
        >
          <Link to={course.adminCourseHref}>
            <ExternalLink className="mr-1.5 size-3.5" aria-hidden />
            Kelola kursus
          </Link>
        </Button>
      </div>
    </article>
  )
}

export function UserDetailReviewCard({ review }: { review: ManagedUserDetailReview }) {
  return (
    <article className={userDetailLayout.card}>
      <div className={userDetailLayout.cardPadding}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <h3 className={userDetailLayout.cardTitle}>{review.courseTitle}</h3>
            <p className={userDetailLayout.cardMeta}>{review.createdAtLabel}</p>
          </div>
          <div className={userDetailLayout.ratingValue}>
            <Star className="size-3.5 fill-current" aria-hidden />
            {formatCourseRatingLabel(review.rating)}
          </div>
        </div>
        <p className={userDetailLayout.reviewBody}>{review.comment}</p>
      </div>
    </article>
  )
}

export function UserDetailTransactionCard({
  transaction,
}: {
  transaction: ManagedUserDetailTransaction
}) {
  return (
    <article className={userDetailLayout.card}>
      <div className={`${userDetailLayout.cardPadding} flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between`}>
        <div className="min-w-0 space-y-2">
          <h3 className={userDetailLayout.cardTitle}>{transaction.courseTitle}</h3>
          <p className={userDetailLayout.cardMeta}>
            {transaction.reference} · {transaction.transactionAtLabel}
          </p>
          <span className={userDetailLayout.metaChip}>{transaction.paymentMethod}</span>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <p className={userDetailLayout.amountValue}>{transaction.amountLabel}</p>
          <PaymentBadge status={transaction.paymentStatus} presentation="dot" />
        </div>
      </div>
    </article>
  )
}
