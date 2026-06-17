import { ClipboardList, ExternalLink } from 'lucide-react'
import { useMemo } from 'react'

import { getAssignmentDeadlineAt } from '@/lib/lesson-assignment/assignment-rules'
import { formatAssignmentDeadlineLabel } from '@/lib/lesson-assignment/deadline-format'
import { parseLessonContent } from '@/lib/rich-text'
import type { LessonDetailAssignment, LessonDetailItem } from '@/lib/types/lesson'
import type { LessonAssignmentSubmissionRecord } from '@/lib/lesson-assignment/types'
import { cn } from '@/lib/utils'

import { AssignmentDeadlineTimer } from './AssignmentDeadlineTimer'
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

  return (
    <main className="min-h-dvh px-4 pb-28 pt-20 sm:px-6 sm:pt-24 md:px-8 xl:px-10">
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
            <h1 className={cn('text-2xl font-bold tracking-tight sm:text-3xl', isDark ? 'text-zinc-50' : 'text-slate-950')}>
              {assignment.title}
            </h1>
            <p className={cn('text-sm', isDark ? 'text-zinc-400' : 'text-slate-500')}>
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
          <section className="space-y-3 border-t border-slate-200/80 pt-5 dark:border-zinc-800/80">
            <h2 className={cn('text-sm font-semibold', isDark ? 'text-zinc-200' : 'text-slate-800')}>
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
                  <div className="ProseMirror" dangerouslySetInnerHTML={{ __html: instruction.contentHtml }} />
                </div>
              </div>
            ) : null}
            {instructionAttachments.length > 0 ? (
              <ul className="space-y-2">
                {instructionAttachments.map((attachment, index) => (
                  <li key={`${attachment.url}-${index}`}>
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className={cn(
                        'inline-flex items-center gap-1.5 text-sm font-medium hover:underline',
                        isDark ? 'text-sky-300' : 'text-primary',
                      )}
                    >
                      <ExternalLink className="size-3.5" aria-hidden />
                      {attachment.name || attachment.url}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ) : null}

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
      </div>
    </main>
  )
}
