import { useMemo } from 'react'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { buildSubmissionHistoryViewModel } from '@/lib/lesson-assignment/submission-history'
import { formatSubmissionSubmittedAt } from '@/lib/lesson-assignment/submission-status'
import type {
  LessonAssignmentSubmissionRecord,
  QuizReviewSummary,
  StudentSubmissionPhase,
} from '@/lib/lesson-assignment/types'
import type { LessonDetailAssignment } from '@/lib/types/lesson'
import { cn } from '@/lib/utils'

import { AssignmentPassStatusBadge } from './AssignmentPassStatusBadge'
import { AssignmentQuizReview } from './AssignmentQuizReview'
import { AssignmentTextSubmissionView } from './AssignmentTextSubmissionView'
import type { LessonThemeMode } from '@/lib/course-module-viewer/lesson-viewer-utils'

type LessonAssignmentDetailPageProps = {
  assignment: LessonDetailAssignment
  submission: LessonAssignmentSubmissionRecord
  phase: StudentSubmissionPhase
  quizReview: QuizReviewSummary | null
  theme: LessonThemeMode
  onBack: () => void
}

export function LessonAssignmentDetailPage({
  assignment,
  submission,
  phase,
  quizReview,
  theme,
  onBack,
}: LessonAssignmentDetailPageProps) {
  const isDark = theme === 'dark'
  const submittedLabel = formatSubmissionSubmittedAt(submission)
  const history = useMemo(
    () => buildSubmissionHistoryViewModel(assignment, submission, phase),
    [assignment, phase, submission],
  )

  return (
    <main className="min-h-dvh px-4 pb-28 pt-20 sm:px-6 sm:pt-24 md:px-8 xl:px-10">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          className={cn(
            '-ml-2 h-9 rounded-[10px] px-3',
            isDark ? 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900',
          )}>
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Kembali ke tugas
        </Button>

        <header className="space-y-3">
          <p className={cn('text-xs font-semibold uppercase tracking-wide', isDark ? 'text-zinc-400' : 'text-slate-500')}>
            Detail pengumpulan
          </p>
          <h1 className={cn('text-2xl font-bold tracking-tight sm:text-3xl', isDark ? 'text-zinc-50' : 'text-slate-950')}>
            {assignment.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3">
            <p className={cn('text-sm tabular-nums', isDark ? 'text-zinc-400' : 'text-slate-500')}>
              Dikumpulkan {submittedLabel}
            </p>
            {history.showScore && history.scoreLabel ? (
              <p className={cn('text-sm font-semibold tabular-nums', isDark ? 'text-zinc-200' : 'text-slate-800')}>
                Nilai {history.scoreLabel}
              </p>
            ) : null}
            {history.showPassResult && history.passOutcomeLabel ? (
              <AssignmentPassStatusBadge
                outcome={history.passOutcome}
                label={history.passOutcomeLabel}
                theme={theme}
              />
            ) : null}
          </div>
        </header>

        <section
          className={cn(
            'rounded-2xl border p-5',
            isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-slate-200 bg-white',
          )}>
          {assignment.task_type === 'quiz' && quizReview ? (
            <AssignmentQuizReview review={quizReview} theme={theme} />
          ) : (
            <AssignmentTextSubmissionView submission={submission} theme={theme} />
          )}
        </section>
      </div>
    </main>
  )
}
