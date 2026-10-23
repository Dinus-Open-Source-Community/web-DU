import { Link } from 'react-router-dom'
import { ExternalLink, Star } from 'lucide-react'

import { formatCourseRatingLabel } from '@/lib/course-detail/course-rating'
import { UserDetailProgressBar } from '@/components/admin/user-manage/user-detail/UserDetailProgressBar'
import {
  AdminPublishStatusLabel,
  AdminStatusLabel,
  type AdminStatusTone,
} from '@/lib/admin/status-label'
import { Button } from '@/components/ui/button'
import type { EnrollmentStatus } from '@/lib/types/common/domain'
import { userDetailLayout } from '@/lib/user-manage/user-detail-layout'
import type {
  ManagedUserDetailJoinedCourse,
  ManagedUserDetailMentoredCourse,
  ManagedUserDetailReview,
} from '@/lib/user-manage/user-detail-types'

const ENROLLMENT_TONE_MAP: Record<EnrollmentStatus, AdminStatusTone> = {
  active: 'info',
  completed: 'success',
  pending: 'warning',
  cancelled: 'danger',
}

export function UserDetailJoinedCourseCard({ course }: { course: ManagedUserDetailJoinedCourse }) {
  return (
    <article className={userDetailLayout.card}>
      <div className={`${userDetailLayout.cardPadding} flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between`}>
        <div className="flex min-w-0 flex-1 items-start gap-3.5">
          {course.thumbnailUrl ? (
            <div className="hidden h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-ink-900/10 bg-paper-white sm:block">
              <img
                src={course.thumbnailUrl}
                alt={course.title}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          ) : null}

          <div className="min-w-0 flex-1 space-y-3">
            <div className="space-y-1">
              <h3 className={userDetailLayout.cardTitle}>{course.title}</h3>
              {course.subtitle ? (
                <p className={userDetailLayout.cardSubtitle}>{course.subtitle}</p>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center rounded-md border border-ink-900/10 bg-paper-white px-2 py-0.5">
                <AdminStatusLabel tone={ENROLLMENT_TONE_MAP[course.enrollmentStatus] ?? 'info'}>
                  {course.enrollmentStatusLabel}
                </AdminStatusLabel>
              </span>
              <span className={userDetailLayout.metaChip}>Level: {course.levelLabel}</span>
              {course.mentorNamesLabel ? (
                <span className={userDetailLayout.metaChip}>
                  Mentor: {course.mentorNamesLabel}
                </span>
              ) : null}
              <span className={userDetailLayout.metaChip}>Terdaftar {course.enrolledAtLabel}</span>
            </div>

            <UserDetailProgressBar label={course.progressLabel} percent={course.progressPercent} />
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
            {course.assignments.map((assignment) => (
              <li key={assignment.submissionUid} className={userDetailLayout.nestedRow}>
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className={userDetailLayout.nestedRowTitle}>{assignment.assignmentTitle}</p>
                    <span className="inline-flex items-center rounded border border-ink-900/10 bg-paper-paper px-1.5 py-0.5 text-[11px] font-bold text-ink-700">
                      {assignment.taskTypeLabel}
                    </span>
                  </div>
                  <p className={userDetailLayout.nestedRowMeta}>
                    {assignment.moduleTitle} · {assignment.lessonTitle}
                  </p>
                  <p className="text-[11px] font-medium text-ink-500">
                    Percobaan ke-{assignment.attemptCount} ·{' '}
                    {assignment.isAutoGraded ? 'Penilaian otomatis' : 'Penilaian manual'}
                    {assignment.deadlineAtLabel ? ` · Tenggat ${assignment.deadlineAtLabel}` : ''}
                    {` · Dikumpulkan ${assignment.submittedAtLabel}`}
                    {assignment.gradedAtLabel ? ` · Dinilai ${assignment.gradedAtLabel}` : ''}
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {assignment.passed !== null ? (
                    <span className="inline-flex items-center rounded-md border border-ink-900/10 bg-paper-offwhite px-2 py-0.5">
                      <AdminStatusLabel tone={assignment.passed ? 'success' : 'danger'}>
                        {assignment.passed ? 'Lulus' : 'Belum lulus'}
                      </AdminStatusLabel>
                    </span>
                  ) : null}
                  <p className={userDetailLayout.nestedRowValue}>
                    {assignment.scorePercent != null
                      ? `Skor ${assignment.scorePercent}%`
                      : 'Belum dinilai'}
                  </p>
                </div>
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
            <span className="inline-flex items-center rounded-md border border-ink-900/10 bg-paper-white px-2 py-0.5">
              <AdminPublishStatusLabel published={course.isPublished} />
            </span>
            <span className={userDetailLayout.metaChip}>Status: {course.statusLabel}</span>
            <span className={userDetailLayout.metaChip}>Level: {course.levelLabel}</span>
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
