import { Link } from 'react-router-dom'
import { ExternalLink, Star } from 'lucide-react'

import { UserDetailProgressBar } from '@/components/admin/user-manage/user-detail/UserDetailProgressBar'
import { Badge, PaymentBadge } from '@/components/ui/badge'
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

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="rounded-full text-[11px] font-medium">
              {course.enrollmentStatusLabel}
            </Badge>
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
        <div className="border-t border-slate-100 px-4 pb-4 sm:px-5 sm:pb-5">
          <p className="mb-3 text-xs font-semibold text-slate-500">
            Pengumpulan tugas ({course.assignments.length})
          </p>
          <ul className="space-y-2">
            {course.assignments.slice(0, 3).map((assignment) => (
              <li
                key={assignment.submissionUid}
                className="flex flex-col gap-1 rounded-xl bg-slate-50 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {assignment.assignmentTitle}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {assignment.moduleTitle} · {assignment.lessonTitle}
                  </p>
                </div>
                <p className="text-xs font-medium tabular-nums text-slate-600">
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

          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={course.isPublished ? 'coursePublished' : 'courseDraft'}
              className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
            >
              {course.isPublished ? 'Terbit' : 'Draft'}
            </Badge>
            <span className={userDetailLayout.metaChip}>{course.priceLabel}</span>
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
          <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
            <Star className="size-3.5 fill-current" aria-hidden />
            {review.rating}
          </div>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-700">{review.comment}</p>
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
          <p className="text-base font-semibold tabular-nums text-slate-900">
            {transaction.amountLabel}
          </p>
          <PaymentBadge status={transaction.paymentStatus} />
        </div>
      </div>
    </article>
  )
}
