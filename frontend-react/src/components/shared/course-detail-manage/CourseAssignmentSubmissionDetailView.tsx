import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'

import { CourseAssignmentSubmissionStudentSidebar } from '@/components/shared/course-detail-manage/CourseAssignmentSubmissionStudentSidebar'
import { StaffSubmissionFeedbackSection } from '@/components/shared/course-detail-manage/StaffSubmissionFeedbackSection'
import { StaffSubmissionInlineGradePanel } from '@/components/shared/course-detail-manage/StaffSubmissionInlineGradePanel'
import { SubmissionDetailSection } from '@/components/shared/course-detail-manage/SubmissionDetailSection'
import { SubmissionContentView } from '@/components/shared/SubmissionContent'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { CourseAssignmentSubmissionDetailPageViewModel } from '@/lib/course-detail/course-assignment-submission-detail-view-model'
import { manageDetailLayout } from '@/lib/course-detail/manage-detail-layout'
import { Initials } from '@/lib/func/func'
import { cn } from '@/lib/utils'

type CourseAssignmentSubmissionDetailViewProps = {
  view: CourseAssignmentSubmissionDetailPageViewModel
}

function DetailGradingBadge({
  view,
}: {
  view: CourseAssignmentSubmissionDetailPageViewModel
}) {
  const submission = view.submission
  if (!submission) return null

  if (submission.taskType === 'quiz') {
    if (!submission.isAutoGraded) {
      return (
        <span className="text-sm text-slate-500">Penilaian kuis otomatis</span>
      )
    }

    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700">
        {submission.quizCorrectCount ?? 0}/{submission.quizQuestionCount ?? 0} benar
      </span>
    )
  }

  if (submission.gradingStatus !== 'graded') {
    return (
      <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
        Menunggu penilaian
      </span>
    )
  }

  const score =
    submission.scorePercent !== null ? `${Math.round(submission.scorePercent)}%` : '-'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium',
        submission.passed
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : 'border-rose-200 bg-rose-50 text-rose-700',
      )}
    >
      <CheckCircle2 className="size-3" aria-hidden />
      {submission.passed ? 'Lulus' : 'Tidak lulus'} - {score}
    </span>
  )
}

function SubmissionDetailMain({
  view,
}: {
  view: CourseAssignmentSubmissionDetailPageViewModel
}) {
  const {
    assignment,
    submission,
    lessonTitle,
    moduleTitle,
    isLoading,
    isError,
    errorMessage,
    backHref,
    staffViewer,
    onSubmitScore,
    onSubmitFeedback,
    isSavingScore,
    isSavingFeedback,
  } = view

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (isError) {
    return (
      <p className={manageDetailLayout.flatError} role="alert">
        {errorMessage ?? 'Gagal memuat jawaban siswa.'}
      </p>
    )
  }

  if (!submission || !assignment) {
    return (
      <div className={manageDetailLayout.flatEmpty}>
        <p className="font-medium text-slate-700">Jawaban tidak ditemukan.</p>
        <p className="mt-1">
          Kiriman mungkin sudah dihapus atau UID tidak valid.
        </p>
      </div>
    )
  }

  const isTextAssignment = submission.taskType === 'text'

  return (
    <div className="flex flex-col">
      <Button
        asChild
        type="button"
        variant="ghost"
        className="mb-4 -ml-2 h-9 w-fit px-3 text-slate-600 hover:text-slate-900"
      >
        <Link to={backHref}>
          <ArrowLeft className="size-4" aria-hidden />
          Kembali ke daftar pengumpulan
        </Link>
      </Button>

      <header className="space-y-5 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            {assignment.title}
          </h1>
          <p className="text-sm text-slate-500">
            {moduleTitle} - {lessonTitle}
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar size="lg">
              {submission.student.avatar_url ? (
                <AvatarImage
                  src={submission.student.avatar_url}
                  alt={submission.student.name}
                />
              ) : null}
              <AvatarFallback>{Initials(submission.student.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-slate-900">
                {submission.student.name}
              </p>
              <p className="mt-0.5 text-sm text-slate-500">
                Attempt {submission.attemptCount} -{' '}
                {format(new Date(submission.submittedAt), 'd MMM yyyy HH:mm', {
                  locale: id,
                })}
              </p>
            </div>
          </div>

          <DetailGradingBadge view={view} />
        </div>
      </header>

      <SubmissionDetailSection title="Jawaban siswa" withTopDivider={false} className="mt-6">
        <div className={manageDetailLayout.submissionDetailBody}>
          <SubmissionContentView blocks={submission.contentBlocks} />
        </div>
      </SubmissionDetailSection>

      {isTextAssignment ? (
        <>
          <StaffSubmissionInlineGradePanel
            submission={submission}
            onSubmit={onSubmitScore}
            isSubmitting={isSavingScore}
          />
          <StaffSubmissionFeedbackSection
            submission={submission}
            staffViewer={staffViewer}
            onSubmit={onSubmitFeedback}
            isSubmitting={isSavingFeedback}
          />
        </>
      ) : null}
    </div>
  )
}

export function CourseAssignmentSubmissionDetailView({
  view,
}: CourseAssignmentSubmissionDetailViewProps) {
  const {
    activeSubmissionUid,
    sidebarRows,
    sidebarSearchQuery,
    onSidebarSearchQueryChange,
    buildSubmissionDetailHref,
    isLoading,
  } = view

  return (
    <div className={manageDetailLayout.submissionDetailShell}>
      <main className={manageDetailLayout.submissionDetailMain}>
        <SubmissionDetailMain view={view} />
      </main>

      <aside className="border-t border-slate-200 lg:border-t-0 lg:border-l">
        <CourseAssignmentSubmissionStudentSidebar
          rows={sidebarRows}
          activeSubmissionUid={activeSubmissionUid}
          searchQuery={sidebarSearchQuery}
          onSearchQueryChange={onSidebarSearchQueryChange}
          buildSubmissionDetailHref={buildSubmissionDetailHref}
          isLoading={isLoading}
        />
      </aside>
    </div>
  )
}
