import { Message } from '@/lib/Message'
import { toRichTextEnvelope } from '@/lib/rich-text'
import type { LessonDetailAssignment } from '@/lib/types/lesson'

import {
  getAssignmentSubmissionBlockReason,
  getAssignmentSubmissionCapabilities,
} from './assignment-rules'
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

export type AssignmentSubmissionValidationResult =
  | { ok: true; payload: SubmitLessonAssignmentPayload }
  | { ok: false; message: string }

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
): AssignmentSubmissionValidationResult {
  const blockReason = getAssignmentSubmissionBlockReason(assignment, submission, now)
  if (blockReason) {
    return { ok: false, message: blockReason }
  }

  const capabilities = getAssignmentSubmissionCapabilities(assignment)

  if (assignment.task_type === 'quiz') {
    const answers = draft.quizAnswers ?? {}
    const unansweredCount = countUnansweredQuizQuestions(
      quizQuestionIds.map((id) => ({ id })),
      answers,
    )

    if (unansweredCount > 0) {
      return { ok: false, message: Message.assignment.answerAllQuizQuestions }
    }

    if (draft.file) {
      return { ok: false, message: Message.assignment.fileNotAllowedForQuiz }
    }

    return { ok: true, payload: { quizAnswers: answers } }
  }

  if (!capabilities.hasAnyMethod) {
    return { ok: false, message: Message.assignment.noActiveSubmitMethod }
  }

  const plainText = capabilities.allowPlainText ? (draft.plainText?.trim() ?? '') : ''
  const richTextHtml = capabilities.allowRichText ? (draft.richTextHtml?.trim() ?? '') : ''
  const file = capabilities.allowFile ? (draft.file ?? null) : null
  const fileDescription = capabilities.allowFile ? (draft.fileDescription?.trim() ?? '') : ''

  const hasPlain = hasMeaningfulPlainText(plainText)
  const hasRich = hasMeaningfulRichTextHtml(richTextHtml)
  const hasFile = file != null

  if (hasPlain && !capabilities.allowPlainText) {
    return { ok: false, message: Message.assignment.plainTextNotAllowed }
  }

  if (hasRich && !capabilities.allowRichText) {
    return { ok: false, message: Message.assignment.richTextNotAllowed }
  }

  if (hasFile && !capabilities.allowFile) {
    return { ok: false, message: Message.assignment.fileUploadNotAllowed }
  }

  if (assignment.require_file_description && hasFile && !fileDescription) {
    return { ok: false, message: Message.assignment.fileDescriptionRequired }
  }

  const hasAllowedPlain = hasPlain && capabilities.allowPlainText
  const hasAllowedRich = hasRich && capabilities.allowRichText
  const hasAllowedFile = hasFile && capabilities.allowFile

  if (!hasAllowedPlain && !hasAllowedRich && !hasAllowedFile) {
    return { ok: false, message: Message.assignment.answerOrFileRequired }
  }

  return {
    ok: true,
    payload: sanitizeSubmissionPayload(assignment, {
      plainText: hasAllowedPlain ? plainText : undefined,
      richText: hasAllowedRich ? toRichTextEnvelope(richTextHtml) : undefined,
      file: hasAllowedFile ? file : undefined,
      fileDescription: fileDescription || undefined,
    }),
  }
}

export function sanitizeSubmissionPayload(
  assignment: LessonDetailAssignment,
  payload: SubmitLessonAssignmentPayload,
): SubmitLessonAssignmentPayload {
  const capabilities = getAssignmentSubmissionCapabilities(assignment)

  if (assignment.task_type === 'quiz') {
    return payload.quizAnswers ? { quizAnswers: payload.quizAnswers } : {}
  }

  const sanitized: SubmitLessonAssignmentPayload = {}

  if (capabilities.allowPlainText && payload.plainText?.trim()) {
    sanitized.plainText = payload.plainText.trim()
  }

  if (capabilities.allowRichText && payload.richText) {
    sanitized.richText = payload.richText
  }

  if (capabilities.allowFile && payload.file) {
    sanitized.file = payload.file
    if (payload.fileDescription?.trim()) {
      sanitized.fileDescription = payload.fileDescription.trim()
    }
  }

  return sanitized
}
