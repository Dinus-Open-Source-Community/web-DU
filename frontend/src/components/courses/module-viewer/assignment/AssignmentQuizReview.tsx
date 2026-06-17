import { CheckCircle2, XCircle } from 'lucide-react'

import { AssignmentQuizPrompt } from './AssignmentQuizPrompt'
import type { QuizReviewSummary } from '@/lib/lesson-assignment/types'
import { cn } from '@/lib/utils'

import type { LessonThemeMode } from '@/lib/course-module-viewer/lesson-viewer-utils'

type AssignmentQuizReviewProps = {
  review: QuizReviewSummary
  theme: LessonThemeMode
}

export function AssignmentQuizReview({ review, theme }: AssignmentQuizReviewProps) {
  const isDark = theme === 'dark'

  return (
    <div className="space-y-4">
      <div
        className={cn(
          'rounded-xl border px-4 py-3',
          isDark ? 'border-zinc-700 bg-zinc-900/60' : 'border-slate-200 bg-slate-50',
        )}>
        <p className={cn('text-sm font-medium', isDark ? 'text-zinc-300' : 'text-slate-600')}>
          Total poin
        </p>
        <p className={cn('mt-1 text-2xl font-bold tabular-nums', isDark ? 'text-zinc-50' : 'text-slate-900')}>
          {review.totalEarned.toFixed(1)} / {review.totalMax.toFixed(1)}
        </p>
        {review.scorePercent != null ? (
          <p className={cn('mt-1 text-sm', isDark ? 'text-zinc-400' : 'text-slate-500')}>
            Skor {review.scorePercent.toFixed(2)}% - Lulus {review.passingScore}%
          </p>
        ) : null}
      </div>

      <div className="space-y-3">
        {review.questions.map((question, index) => (
          <article
            key={question.questionId}
            className={cn(
              'rounded-xl border p-4',
              isDark ? 'border-zinc-700 bg-zinc-900/40' : 'border-slate-200 bg-white',
            )}>
            <div className="flex items-start justify-between gap-3">
              <AssignmentQuizPrompt index={index} promptHtml={question.prompt} theme={theme} className="min-w-0 flex-1" />
              <span
                className={cn(
                  'shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums',
                  question.isCorrect
                    ? isDark
                      ? 'bg-emerald-500/15 text-emerald-300'
                      : 'bg-emerald-50 text-emerald-700'
                    : isDark
                      ? 'bg-rose-500/15 text-rose-300'
                      : 'bg-rose-50 text-rose-700',
                )}>
                {question.pointsEarned.toFixed(1)} poin
              </span>
            </div>

            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-start gap-2">
                {question.isCorrect ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
                ) : (
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" aria-hidden />
                )}
                <p className={isDark ? 'text-zinc-300' : 'text-slate-700'}>
                  Jawaban Anda: <span className="font-medium">{question.selectedLabel}</span>
                </p>
              </div>
              {!question.isCorrect ? (
                <p className={cn('pl-6', isDark ? 'text-zinc-400' : 'text-slate-500')}>
                  Jawaban benar: <span className="font-medium text-primary">{question.correctLabel}</span>
                </p>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
