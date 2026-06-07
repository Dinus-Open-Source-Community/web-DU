import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { TiptapEditor } from '@/components/shared/TipTapEditor'
import { Button } from '@/components/ui/button'
import { getAssignmentDeadlineAt } from '@/lib/lesson-assignment/assignment-rules'
import type { NormalizedQuiz } from '@/lib/lesson-assignment/quiz-payload'
import { validateAssignmentSubmissionDraft, type SubmitLessonAssignmentPayload } from '@/lib/lesson-assignment/submission-draft'
import type { LessonAssignmentSubmissionRecord, QuizAnswersMap } from '@/lib/lesson-assignment/types'
import type { LessonDetailAssignment, LessonDetailItem } from '@/lib/types/lesson'
import { cn } from '@/lib/utils'

import { AssignmentDeadlineTimer } from './AssignmentDeadlineTimer'
import { AssignmentFileUploadField } from './AssignmentFileUploadField'
import { AssignmentQuizPrompt } from './AssignmentQuizPrompt'
import { AssignmentWorkInstructions } from './AssignmentWorkInstructions'
import type { LessonThemeMode } from '../utils'

type LessonAssignmentWorkProps = {
  lesson: LessonDetailItem
  assignment: LessonDetailAssignment
  submission: LessonAssignmentSubmissionRecord | null
  quiz: NormalizedQuiz | null
  theme: LessonThemeMode
  isSubmitting: boolean
  onCancel: () => void
  onSubmit: (payload: SubmitLessonAssignmentPayload) => Promise<void>
}

export function LessonAssignmentWork({
  lesson: _lesson,
  assignment,
  submission,
  quiz,
  theme,
  isSubmitting,
  onCancel,
  onSubmit,
}: LessonAssignmentWorkProps) {
  const isDark = theme === 'dark'
  const deadlineAt = getAssignmentDeadlineAt(assignment)
  const [plainText, setPlainText] = useState('')
  const [richTextHtml, setRichTextHtml] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [fileDescription, setFileDescription] = useState('')
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswersMap>({})

  const showPlainTextInput = assignment.allow_plain_text_submission
  const showRichTextInput = assignment.allow_rich_text_submission
  const showFileInput = assignment.allow_file_submission
  const isQuiz = assignment.task_type === 'quiz'

  const quizQuestionIds = useMemo(() => quiz?.questions.map((question) => question.id) ?? [], [quiz])

  async function handleSubmit() {
    const validation = validateAssignmentSubmissionDraft(
      assignment,
      {
        plainText,
        richTextHtml,
        file,
        fileDescription,
        quizAnswers,
      },
      quizQuestionIds,
      submission,
    )

    if (!validation.ok) {
      toast.error(validation.message)
      return
    }

    await onSubmit(validation.payload)
  }

  return (
    <main className="min-h-dvh px-4 pb-28 pt-20 sm:px-6 sm:pt-24 md:px-8 xl:px-10">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <header className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className={cn('text-xs font-semibold uppercase tracking-wide', isDark ? 'text-zinc-400' : 'text-slate-500')}>
                Pengerjaan {isQuiz ? 'kuis' : 'tugas'}
              </p>
              <h1 className={cn('mt-1 text-2xl font-bold tracking-tight', isDark ? 'text-zinc-50' : 'text-slate-950')}>
                {assignment.title}
              </h1>
            </div>
            <AssignmentDeadlineTimer deadlineAt={deadlineAt} status={assignment.status} theme={theme} className="shrink-0" />
          </div>
        </header>

        <AssignmentWorkInstructions assignment={assignment} theme={theme} />

        {isQuiz ? (
          <section className="space-y-8 border-t border-slate-200/80 pt-6 dark:border-zinc-800/80">
            <h2 className={cn('text-sm font-semibold', isDark ? 'text-zinc-200' : 'text-slate-800')}>
              Soal
            </h2>

            {quiz?.questions.length ? (
              <div className="space-y-8">
                {quiz.questions.map((question, index) => (
                  <div
                    key={question.id}
                    className="space-y-4 border-b border-slate-200/80 pb-8 last:border-b-0 last:pb-0 dark:border-zinc-800/80"
                  >
                    <AssignmentQuizPrompt index={index} promptHtml={question.promptHtml} theme={theme} />
                    <div className="space-y-2">
                      {question.options.map((option) => {
                        const selected = quizAnswers[question.id] === option.id
                        return (
                          <label
                            key={option.id}
                            className={cn(
                              'flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                              selected
                                ? isDark
                                  ? 'bg-primary/10 text-zinc-50 ring-1 ring-primary/40'
                                  : 'bg-primary/5 text-slate-900 ring-1 ring-primary/30'
                                : isDark
                                  ? 'hover:bg-zinc-900/60'
                                  : 'hover:bg-slate-50',
                            )}
                          >
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              checked={selected}
                              onChange={() =>
                                setQuizAnswers((current) => ({
                                  ...current,
                                  [question.id]: option.id,
                                }))
                              }
                              className="h-4 w-4 accent-primary"
                            />
                            <span>{option.label}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={cn('text-sm', isDark ? 'text-zinc-400' : 'text-slate-500')}>
                Soal kuis belum tersedia. Silakan hubungi mentor atau coba lagi nanti.
              </p>
            )}
          </section>
        ) : (
          <section className="space-y-6 border-t border-slate-200/80 pt-6 dark:border-zinc-800/80">
            <h2 className={cn('text-sm font-semibold', isDark ? 'text-zinc-200' : 'text-slate-800')}>
              Jawaban Anda
            </h2>

            {showPlainTextInput ? (
              <div className="space-y-2">
                <label htmlFor="assignment-answer" className={cn('text-sm font-medium', isDark ? 'text-zinc-200' : 'text-slate-800')}>
                  Teks jawaban
                </label>
                <textarea
                  id="assignment-answer"
                  value={plainText}
                  onChange={(event) => setPlainText(event.target.value)}
                  rows={8}
                  className={cn(
                    'w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                    isDark ? 'border-zinc-800 bg-zinc-950 text-zinc-100' : 'border-slate-200 bg-white text-slate-900',
                  )}
                  placeholder="Tulis jawaban tugas di sini..."
                />
              </div>
            ) : null}

            {showRichTextInput ? (
              <div className="space-y-2">
                <p className={cn('text-sm font-medium', isDark ? 'text-zinc-200' : 'text-slate-800')}>
                  {showPlainTextInput ? 'Jawaban format rich text' : 'Jawaban'}
                </p>
                <TiptapEditor
                  initialContent={richTextHtml}
                  onChange={setRichTextHtml}
                  placeholder="Tulis jawaban tugas di sini..."
                  variant="compact"
                />
              </div>
            ) : null}

            {showFileInput ? (
              <AssignmentFileUploadField
                file={file}
                fileDescription={fileDescription}
                requireDescription={assignment.require_file_description}
                theme={theme}
                onFileChange={setFile}
                onDescriptionChange={setFileDescription}
              />
            ) : null}
          </section>
        )}

        <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200/80 pt-6 dark:border-zinc-800/80">
          <Button type="button" variant="outline" onClick={onCancel} className="rounded-[10px] px-5">
            Kembali
          </Button>
          <Button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={isSubmitting || (isQuiz && !quiz?.questions.length)}
            className="rounded-[10px] px-5"
          >
            {isSubmitting ? 'Mengumpulkan...' : 'Kumpulkan'}
          </Button>
        </div>
      </div>
    </main>
  )
}
