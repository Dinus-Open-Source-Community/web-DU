import { CheckCircle2, ClipboardList, ExternalLink } from 'lucide-react'
import { useMemo } from 'react'

import { SanitizedHtml } from '@/components/shared/SanitizedHtml'
import { SafeExternalLink } from '@/components/shared/SafeExternalLink'
import { getAssignmentDeadlineAt } from '@/lib/lesson-assignment/assignment-rules'
import { formatAssignmentDeadlineLabel } from '@/lib/lesson-assignment/deadline-format'
import { normalizeQuizPayload } from '@/lib/lesson-assignment/quiz-payload'
import { parseLessonContent } from '@/lib/rich-text'
import type { IQuiz, LessonDetailAssignment, LessonDetailItem } from '@/lib/types/lesson'
import type { LessonAssignmentSubmissionRecord } from '@/lib/lesson-assignment/types'
import { cn } from '@/lib/utils'

import { AssignmentDeadlineTimer } from './AssignmentDeadlineTimer'
import { AssignmentQuizPrompt } from './AssignmentQuizPrompt'
import { AssignmentSubmissionHistorySection } from './AssignmentSubmissionHistorySection'
import type { LessonThemeMode } from '@/lib/course-module-viewer/lesson-viewer-utils'

type LessonAssignmentOverviewProps = {
  lesson: LessonDetailItem
  assignment: LessonDetailAssignment
  submission: LessonAssignmentSubmissionRecord | null
  submissionAttempts: LessonAssignmentSubmissionRecord[]
  submissionMaxAttempts?: number | null
  canStart: boolean
  submissionBlockReason?: string | null
  theme: LessonThemeMode
  /** Pratinjau mentor/admin: sembunyikan riwayat & aksi pengumpulan. */
  readOnly?: boolean
  onStart: () => void
  onViewDetail: () => void
}

export function LessonAssignmentOverview({
  assignment,
  submission,
  submissionAttempts,
  submissionMaxAttempts,
  canStart,
  submissionBlockReason,
  theme,
  readOnly = false,
  onStart,
  onViewDetail,
}: LessonAssignmentOverviewProps) {
  const isDark = theme === 'dark'
  const deadlineAt = getAssignmentDeadlineAt(assignment)
  const instruction = assignment.task_description ? parseLessonContent(assignment.task_description) : null
  const instructionAttachments = assignment.instruction_attachments ?? []
  const deadlineLabel = useMemo(
    () => formatAssignmentDeadlineLabel(deadlineAt),
    [deadlineAt],
  )
  const isQuiz = assignment.task_type === 'quiz'
  const quiz = useMemo(
    () => (isQuiz ? normalizeQuizPayload(assignment.quiz_payload as IQuiz | null) : null),
    [assignment.quiz_payload, isQuiz],
  )

  return (
    <main className="min-h-dvh px-4 pb-28 pt-20 sm:px-6 sm:pt-24 md:px-8 lg:px-10">
      <div className="mx-auto w-full max-w-3xl space-y-8">
        <header className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
                assignment.task_type === 'quiz'
                  ? isDark
                    ? 'bg-violet-500/15 text-violet-300'
                    : 'bg-violet-50 text-violet-700'
                  : isDark
                    ? 'bg-sky-500/15 text-sky-300'
                    : 'bg-sky-50 text-sky-700',
              )}>
              <ClipboardList className="h-3.5 w-3.5" aria-hidden />
              {assignment.task_type === 'quiz' ? 'Kuis' : 'Tugas'}
            </span>
            <AssignmentDeadlineTimer
              deadlineAt={deadlineAt}
              status={assignment.status}
              theme={theme}
              className="shrink-0"
            />
          </div>
          <div className="space-y-2">
            <h1 className={cn('text-2xl font-bold tracking-tight sm:text-3xl', isDark ? 'text-zinc-50' : 'text-ink-900')}>
              {assignment.title}
            </h1>
            <p className={cn('text-sm', isDark ? 'text-zinc-400' : 'text-ink-500')}>
              {deadlineLabel ? (
                <>
                  <span className="font-medium tabular-nums">{deadlineLabel.relative}</span>
                  <span className="mx-1.5" aria-hidden>
                    ·
                  </span>
                  <span className="tabular-nums">{deadlineLabel.absolute}</span>
                </>
              ) : null}
            </p>
          </div>
        </header>

        {instruction?.contentHtml || instructionAttachments.length > 0 ? (
          <section className="space-y-3 border-t border-ink-900/10 dark:border-zinc-800 pt-5">
            <h2 className={cn('text-sm font-semibold', isDark ? 'text-zinc-200' : 'text-ink-800')}>
              Instruksi
            </h2>
            {instruction?.contentHtml ? (
              <div
                className={cn(
                  'lesson-reader text-sm leading-7',
                  isDark ? 'lesson-reader--dark' : 'lesson-reader--light',
                )}
              >
                <div className="tiptap-editor-root tiptap-preview">
                  <SanitizedHtml html={instruction.contentHtml} className="ProseMirror" />
                </div>
              </div>
            ) : null}
            {instructionAttachments.length > 0 ? (
              <ul className="space-y-2">
                {instructionAttachments.map((attachment, index) => (
                  <li key={`${attachment.url}-${index}`}>
                    <SafeExternalLink
                      href={attachment.url}
                      className={cn(
                        'inline-flex items-center gap-1.5 text-sm font-medium hover:underline',
                        isDark ? 'text-sky-300' : 'text-primary',
                      )}
                    >
                      <ExternalLink className="size-3.5" aria-hidden />
                      {attachment.name || attachment.url}
                    </SafeExternalLink>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ) : null}

        {readOnly && isQuiz ? (
          <section className="space-y-6 border-t border-ink-900/10 dark:border-zinc-800 pt-6">
            <div className="flex flex-col gap-2 rounded-xl border border-line-light bg-paper-paper/60 p-4 dark:border-zinc-700 dark:bg-zinc-900/50 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className={cn('text-base font-semibold', isDark ? 'text-zinc-100' : 'text-ink-900')}>
                  Pratinjau Soal Kuis
                </h2>
                <p className={cn('mt-0.5 text-xs', isDark ? 'text-zinc-400' : 'text-ink-500')}>
                  {quiz?.questions.length ?? 0} soal · Standar kelulusan {quiz?.passingScore ?? 70}%
                </p>
              </div>
              <span
                className={cn(
                  'inline-flex self-start rounded-full px-2.5 py-1 text-xs font-semibold sm:self-auto',
                  isDark ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary',
                )}
              >
                Mode Pratinjau
              </span>
            </div>

            {quiz && quiz.questions.length > 0 ? (
              <div className="space-y-5">
                {quiz.questions.map((question, index) => (
                  <article
                    key={question.id}
                    className={cn(
                      'space-y-4 rounded-xl border p-4 sm:p-5',
                      isDark ? 'border-zinc-800 bg-zinc-900/40' : 'border-line-light bg-paper-white shadow-xs',
                    )}
                  >
                    <AssignmentQuizPrompt
                      index={index}
                      promptHtml={question.promptHtml}
                      theme={theme}
                    />

                    <div className="space-y-2 pl-6 pt-1">
                      {question.options.map((option, optIdx) => {
                        const isCorrect = option.id === question.correctOptionId
                        const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
                        const labelChar = optionLabels[optIdx] ?? String(optIdx + 1)
                        return (
                          <div
                            key={option.id}
                            className={cn(
                              'flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm transition-colors',
                              isCorrect
                                ? isDark
                                  ? 'border-emerald-700/60 bg-emerald-950/25 text-emerald-200'
                                  : 'border-emerald-300 bg-emerald-50/70 text-emerald-900'
                                : isDark
                                  ? 'border-zinc-800 bg-zinc-900/30 text-zinc-300'
                                  : 'border-line-light/80 bg-paper-paper/40 text-ink-700',
                            )}
                          >
                            <div className="flex min-w-0 flex-1 items-center gap-2.5">
                              <span
                                className={cn(
                                  'flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                                  isCorrect
                                    ? isDark
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-emerald-500 text-white'
                                    : isDark
                                      ? 'bg-zinc-800 text-zinc-400'
                                      : 'border border-line-medium bg-paper-paper text-ink-500',
                                )}
                              >
                                {labelChar}
                              </span>
                              <span className="truncate">{option.label || <span className="italic text-ink-400">(Kosong)</span>}</span>
                            </div>

                            {isCorrect && (
                              <span
                                className={cn(
                                  'inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold',
                                  isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700',
                                )}
                              >
                                <CheckCircle2 className="size-3" aria-hidden />
                                Kunci Jawaban
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {question.explanation && (
                      <div
                        className={cn(
                          'mt-3 rounded-lg border p-3 text-xs leading-relaxed',
                          isDark
                            ? 'border-sky-800/40 bg-sky-950/20 text-sky-200'
                            : 'border-sky-200 bg-sky-50/60 text-sky-900',
                        )}
                      >
                        <p className="mb-0.5 font-semibold text-primary">Penjelasan:</p>
                        <p>{question.explanation}</p>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <div
                className={cn(
                  'rounded-xl border border-dashed p-8 text-center text-sm',
                  isDark ? 'border-zinc-800 text-zinc-400' : 'border-line-medium text-ink-500',
                )}
              >
                Kuis ini belum memiliki daftar pertanyaan.
              </div>
            )}
          </section>
        ) : null}

        {readOnly ? null : (
          <AssignmentSubmissionHistorySection
            assignment={assignment}
            submission={submission}
            submissionAttempts={submissionAttempts}
            submissionMaxAttempts={submissionMaxAttempts}
            canStart={canStart}
            submissionBlockReason={submissionBlockReason}
            theme={theme}
            onStart={onStart}
            onViewDetail={onViewDetail}
          />
        )}
      </div>
    </main>
  )
}
