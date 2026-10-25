import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CalendarClock, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

import { ChartCard } from '@/components/shared/ChartCard'
import ResumeCard from '@/components/shared/ResumeCard'
import FeedbackCard from '@/components/shared/Feedback'
import { PageHeader } from '@/components/shared/Header'
import { Button } from '@/components/ui/button'
import { StudentKpiGrid } from '@/components/student/dashboard/StudentKpiGrid'
import { PlayfulEmptyIllustration } from '@/components/playful/PublicLottieIllustration'
import { appCardClassName, appToolbarPrimaryButtonClassName } from '@/lib/design/app-shell-tokens'
import {
  isLearningProgressInProgress,
  toLearningProgressPercent,
} from '@/lib/learning/progress'
import { studentDashboardLayout } from '@/lib/layout/student-dashboard-layout'
import { gridCardsClassName, gridMainSidebarClassName } from '@/lib/layout/page-layout'
import { ROUTES } from '@/lib/routes'
import type { IUserData } from '@/lib/types/user'
import type { StudentAssignmentSectionItem } from '@/lib/types/student-assignments'
import { useStudentAssignmentItems } from '@/hooks/student-assignments/use-student-assignment-items'
import { buildStudentAssignmentHref } from '@/lib/student-assignments/assignment-navigation'
import { formatAssignmentDeadlineRelative } from '@/lib/student-assignments/format-assignment-deadline'
import { cn } from '@/lib/utils'

const feedbackDateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000
const SIX_HOURS_MS = 6 * 60 * 60 * 1000

function UpcomingDeadlineCard({
  item,
  now,
}: {
  item: StudentAssignmentSectionItem
  now: Date
}) {
  const deadlineDate = new Date(item.assignment.deadlineAt)
  const diff = deadlineDate.getTime() - now.getTime()
  const isCritical = diff <= SIX_HOURS_MS
  const formattedDeadline = format(deadlineDate, 'd MMM yyyy, HH:mm', { locale: id })
  const relativeDeadline = formatAssignmentDeadlineRelative(
    item.assignment.deadlineAt,
    now,
    'due_soon',
  )
  const href = buildStudentAssignmentHref({
    courseUid: item.assignment.courseId,
    lessonUid: item.lessonUid,
    openAssignmentPane: true,
  })
  const isRevision = item.latestSubmission?.reviewStatus === 'returned'

  return (
    <div
        className={cn(
          appCardClassName,
          'flex min-h-[210px] flex-col justify-between gap-3 p-4 shadow-none transition-all hover:bg-paper-paper/50',
        )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="line-clamp-1 text-xs font-bold uppercase tracking-wider text-primary">
            {item.courseTitle}
          </p>
          <h4 className="mt-1 line-clamp-1 text-sm font-bold text-ink-900">
            {item.assignment.title}
          </h4>
          {item.moduleTitle && item.lessonTitle && (
            <p className="mt-0.5 line-clamp-1 text-xs text-ink-500">
              {item.moduleTitle} · {item.lessonTitle}
            </p>
          )}
        </div>
        <span
          className={cn(
            'inline-flex shrink-0 items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold',
            isCritical
              ? 'border-rose-200 bg-rose-50 text-rose-700'
              : 'border-amber-200 bg-amber-50 text-amber-800',
          )}
        >
          <Clock className="h-3 w-3 shrink-0" />
          {relativeDeadline}
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line-light/70 pt-3">
        <div className="flex items-center gap-1.5 text-xs text-ink-500">
          <CalendarClock className="h-3.5 w-3.5 text-ink-400" />
          <span>{formattedDeadline}</span>
        </div>
        <Button
          asChild
          size="sm"
          variant="default"
          className="h-8 gap-1.5 px-3 text-xs font-semibold shadow-none active:scale-[0.98]"
        >
          <Link to={href}>
            {isRevision ? 'Revisi Tugas' : 'Kerjakan'}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  )
}

type DashboardSectionProps = {
  Data: IUserData
}

const DashboardSection = ({ Data }: DashboardSectionProps) => {
  const [now] = useState(() => new Date())
  const { items: assignmentItems, isLoading: isAssignmentsLoading } =
    useStudentAssignmentItems(Data, {
      fetchAll: false,
      params: { page: 1, per_page: 3 },
    })

  const urgentDeadlines = useMemo(() => {
    const nowTimestamp = now.getTime()

    return assignmentItems
      .filter((item) => {
        if (item.assignment.status === 'draft') return false

        const reviewStatus = item.latestSubmission?.reviewStatus
        if (reviewStatus === 'graded' || reviewStatus === 'pending_review') {
          return false
        }

        if (!item.assignment.deadlineAt) return false
        const deadlineTime = new Date(item.assignment.deadlineAt).getTime()
        if (!Number.isFinite(deadlineTime)) return false

        const diff = deadlineTime - nowTimestamp
        return diff > 0 && diff < TWENTY_FOUR_HOURS_MS
      })
      .sort((a, b) => {
        const timeA = new Date(a.assignment.deadlineAt).getTime()
        const timeB = new Date(b.assignment.deadlineAt).getTime()
        return timeA - timeB
      })
      .slice(0, 3)
  }, [assignmentItems, now])
  const resumeCourses = useMemo(() => {
    return (Data?.joined_courses ?? [])
      .filter((course) => isLearningProgressInProgress(course.progress))
      .sort((a, b) => {
        const diff =
          toLearningProgressPercent(a.progress) -
          toLearningProgressPercent(b.progress)
        if (diff !== 0) return diff
        return (a.title ?? '').localeCompare(b.title ?? '')
      })
      .slice(0, 4)
  }, [Data.joined_courses])
  const recentFeedback = Data.course_reviews.slice(0, 3).map((review) => ({
    status: (review.rating >= 4 ? 'Lulus' : 'Perlu Revisi') as 'Lulus' | 'Perlu Revisi',
    time: feedbackDateFormatter.format(new Date(review.created_at)),
    title: review.course.title,
    comment: review.comment,
    instructor: {
      name: Data.name,
      avatar: Data.avatar_url || '/Logo.svg',
    },
  }))

  return (
    <>
      <PageHeader
        className={studentDashboardLayout.pageHeader}
        title="Dasbor"
        subtitle={`Halo, ${Data.name}! Siap melanjutkan perjalanan belajarmu hari ini?`}
      />

      <StudentKpiGrid summary={Data.enrollment_summary} />

      <section className="flex flex-col gap-4 rounded-xl border-2 border-ink-900/10 bg-paper-white p-5 sm:p-6 shadow-paper">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-lg font-bold tracking-tight text-ink-900 sm:text-xl">
              Lanjutkan Belajar
            </h2>
            <p className="text-xs font-medium text-ink-500 sm:text-sm">
              Kursus yang masih berjalan — lanjutkan dari progres terakhir
            </p>
          </div>
          <Button
            asChild
            variant="default"
            size="default"
            className={cn(appToolbarPrimaryButtonClassName, 'shrink-0 self-start')}
          >
            <Link to={ROUTES.student.learning}>Lihat Semua</Link>
          </Button>
        </div>

        {resumeCourses.length > 0 ? (
          <div className={gridCardsClassName}>
            {resumeCourses.map((course) => (
              <ResumeCard key={course.uid} data={course} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <PlayfulEmptyIllustration
              variant="nothing"
              maxWidthClassName="max-w-[12rem] sm:max-w-[14rem]"
              className="mb-2"
            />
            <p className="text-sm font-medium text-ink-500">
              Belum ada kursus untuk dilanjutkan.
            </p>
          </div>
        )}
      </section>

      <div className={gridMainSidebarClassName}>
        <ChartCard
          title="Tenggat Waktu"
          subtitle="Deadline tugas dan pengumpulan mendatang"
          action={
            <Button
              asChild
              variant="default"
              size="default"
              className={cn(appToolbarPrimaryButtonClassName, 'shrink-0 self-start')}
            >
              <Link to={ROUTES.student.assignments}>
                Lihat Semua
              </Link>
            </Button>
          }
        >
          {isAssignmentsLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-28 animate-pulse rounded-xl border-2 border-ink-900/10 bg-paper-paper/60"
                />
              ))}
            </div>
          ) : urgentDeadlines.length > 0 ? (
            <div className="space-y-3">
              {urgentDeadlines.map((item) => (
                <UpcomingDeadlineCard
                  key={item.assignment.uid}
                  item={item}
                  now={now}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <PlayfulEmptyIllustration
                variant="late"
                maxWidthClassName="max-w-[11rem] sm:max-w-[13rem]"
                className="mb-2"
              />
              <p className="text-sm font-medium text-ink-500">
                Tidak ada tenggat waktu saat ini.
              </p>
            </div>
          )}
        </ChartCard>

        <ChartCard title="Umpan Balik" subtitle="Ulasan kursus dan catatan terbaru">
          {recentFeedback.length > 0 ? (
            <div className="space-y-3">
              {recentFeedback.map((fb, i) => (
                <FeedbackCard
                  key={i}
                  status={fb.status}
                  time={fb.time}
                  title={fb.title}
                  comment={fb.comment}
                  instructor={fb.instructor}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <PlayfulEmptyIllustration
                variant="review"
                maxWidthClassName="max-w-[11rem] sm:max-w-[13rem]"
                className="mb-2"
              />
              <p className="text-sm font-medium text-ink-500">
                Belum ada umpan balik terbaru.
              </p>
            </div>
          )}
        </ChartCard>
      </div>
    </>
  )
}

export default DashboardSection
