import { toRichTextEnvelope } from '@/lib/rich-text'
import type { LessonDetailAssignment } from '@/lib/types/lesson'

import { getAssignmentSubmissionBlockReason } from './assignment-rules'
import type { LessonAssignmentSubmissionRecord, QuizAnswersMap } from './types'

const EMPTY_HTML_PATTERN = /^(?:<p>\s*(?:<br\s*\/?>)?\s*<\/p>|<br\s*\/?>|\s|&nbsp;)*$/i

export type AssignmentSubmissionDraft = {
  plainText?: string
  richTextHtml?: string
  file?: File | null
  fileDescription?: string
  quizAnswers?: QuizAnswersMap
}

export type SubmitLessonAssignmentPayload = {
  plainText?: string
  richText?: ReturnType<typeof toRichTextEnvelope> | null
  file?: File | null
  fileDescription?: string
  quizAnswers?: QuizAnswersMap
}

function hasMeaningfulPlainText(value: string) {
  return value.trim().length > 0
}

function hasMeaningfulRichTextHtml(html: string) {
  const trimmed = html.trim()
  if (!trimmed) return false
  return !EMPTY_HTML_PATTERN.test(trimmed)
}

function countUnansweredQuizQuestions(questions: { id: string }[], answers: QuizAnswersMap) {
  return questions.filter((question) => !answers[question.id]?.trim()).length
}

export function validateAssignmentSubmissionDraft(
  assignment: LessonDetailAssignment,
  draft: AssignmentSubmissionDraft,
  quizQuestionIds: string[] = [],
  submission: LessonAssignmentSubmissionRecord | null = null,
  now = new Date(),
): { ok: true; payload: SubmitLessonAssignmentPayload } | { ok: false; message: string } {
  const blockReason = getAssignmentSubmissionBlockReason(assignment, submission, now)
  if (blockReason) {
    return { ok: false, message: blockReason }
  }

  if (assignment.task_type === 'quiz') {
    const answers = draft.quizAnswers ?? {}
    const unansweredCount = countUnansweredQuizQuestions(
      quizQuestionIds.map((id) => ({ id })),
      answers,
    )

    if (unansweredCount > 0) {
      return { ok: false, message: 'Jawab semua pertanyaan sebelum mengumpulkan.' }
    }

    if (draft.file) {
      return { ok: false, message: 'Unggahan file tidak diizinkan untuk kuis.' }
    }

    return { ok: true, payload: { quizAnswers: answers } }
  }

  const plainText = draft.plainText?.trim() ?? ''
  const richTextHtml = draft.richTextHtml?.trim() ?? ''
  const file = draft.file ?? null
  const fileDescription = draft.fileDescription?.trim() ?? ''

  const hasPlain = hasMeaningfulPlainText(plainText)
  const hasRich = hasMeaningfulRichTextHtml(richTextHtml)
  const hasFile = file != null

  if (hasPlain && !assignment.allow_plain_text_submission) {
    return { ok: false, message: 'Jawaban teks biasa tidak diizinkan untuk tugas ini.' }
  }

  if (hasRich && !assignment.allow_rich_text_submission) {
    return { ok: false, message: 'Jawaban rich text tidak diizinkan untuk tugas ini.' }
  }

  if (hasFile && !assignment.allow_file_submission) {
    return { ok: false, message: 'Unggahan file tidak diizinkan untuk tugas ini.' }
  }

  if (assignment.require_file_description && hasFile && !fileDescription) {
    return { ok: false, message: 'Deskripsi file wajib diisi.' }
  }

  const hasAllowedPlain = hasPlain && assignment.allow_plain_text_submission
  const hasAllowedRich = hasRich && assignment.allow_rich_text_submission
  const hasAllowedFile = hasFile && assignment.allow_file_submission

  if (!hasAllowedPlain && !hasAllowedRich && !hasAllowedFile) {
    return { ok: false, message: 'Isi jawaban atau unggah file terlebih dahulu.' }
  }

  return {
    ok: true,
    payload: {
      plainText: hasAllowedPlain ? plainText : undefined,
      richText: hasAllowedRich ? toRichTextEnvelope(richTextHtml) : undefined,
      file: hasAllowedFile ? file : undefined,
      fileDescription: fileDescription || undefined,
    },
  }
}
