import type { IRichTextEnvelope } from '@/lib/types/rich-text'
import type { LessonAssignmentGrading, LessonAssignmentSubmissionRecord, QuizAnswersMap } from './types'

function parseRichTextValue(raw: unknown): IRichTextEnvelope | string | null {
  if (raw == null) return null
  if (typeof raw === 'string') return raw
  if (typeof raw === 'object' && 'contentHtml' in raw && typeof (raw as IRichTextEnvelope).contentHtml === 'string') {
    return raw as IRichTextEnvelope
  }
  return null
}

function parseQuizAnswers(raw: unknown): QuizAnswersMap {
  if (!raw || typeof raw !== 'object') return {}

  const answers: QuizAnswersMap = {}
  for (const [questionId, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value === 'string' && value.trim()) {
      answers[questionId] = value.trim()
    }
  }

  return answers
}

function mapGrading(raw: unknown, submissionRaw?: Record<string, unknown>): LessonAssignmentGrading {
  const grading = (raw ?? {}) as Record<string, unknown>
  const submission = submissionRaw ?? {}

  const scorePercent =
    typeof grading.score_percent === 'number'
      ? grading.score_percent
      : typeof submission.score_percent === 'number'
        ? submission.score_percent
        : null

  const passed =
    typeof grading.passed === 'boolean'
      ? grading.passed
      : typeof submission.passed === 'boolean'
        ? submission.passed
        : null

  const feedback =
    typeof grading.feedback === 'string'
      ? grading.feedback
      : typeof submission.feedback === 'string'
        ? submission.feedback
        : ''

  const hasFeedback =
    typeof grading.has_feedback === 'boolean'
      ? grading.has_feedback
      : feedback.trim().length > 0

  const isGraded =
    typeof grading.is_graded === 'boolean'
      ? grading.is_graded
      : scorePercent != null || typeof submission.graded_at === 'string'

  return {
    scorePercent,
    passed,
    feedback,
    hasFeedback,
    isGraded,
    gradedAt:
      typeof grading.graded_at === 'string'
        ? grading.graded_at
        : typeof submission.graded_at === 'string'
          ? submission.graded_at
          : null,
    isAutoGraded: Boolean(grading.is_auto_graded ?? submission.is_auto_graded),
    quizCorrectCount:
      typeof grading.quiz_correct_count === 'number'
        ? grading.quiz_correct_count
        : typeof submission.quiz_correct_count === 'number'
          ? submission.quiz_correct_count
          : null,
    quizQuestionCount:
      typeof grading.quiz_question_count === 'number'
        ? grading.quiz_question_count
        : typeof submission.quiz_question_count === 'number'
          ? submission.quiz_question_count
          : null,
  }
}

function extractSubmissionPayload(raw: unknown): Record<string, unknown> {
  const payload = (raw ?? {}) as Record<string, unknown>

  // Format GET setelah merge backend-fajar: { submission_uid, submissions[], latest_attempt_number }
  if (Array.isArray(payload.submissions) && payload.submissions.length > 0) {
    const attempts = payload.submissions as Record<string, unknown>[]
    const latest = attempts[attempts.length - 1] ?? {}
    const attemptCount =
      typeof payload.latest_attempt_number === 'number'
        ? payload.latest_attempt_number
        : typeof latest.attempt_number === 'number'
          ? latest.attempt_number
          : 1

    return {
      ...latest,
      uid: String(payload.submission_uid ?? latest.uid ?? ''),
      attempt_count: attemptCount,
      created_at:
        typeof latest.submitted_at === 'string'
          ? latest.submitted_at
          : typeof latest.created_at === 'string'
            ? latest.created_at
            : '',
      updated_at:
        typeof latest.submitted_at === 'string'
          ? latest.submitted_at
          : typeof latest.updated_at === 'string'
            ? latest.updated_at
            : '',
    }
  }

  // Format POST/PUT atau legacy GET: entity submission langsung
  return (payload.submission ?? payload) as Record<string, unknown>
}

export function mapLessonAssignmentSubmissionResponse(raw: unknown): LessonAssignmentSubmissionRecord {
  const payload = (raw ?? {}) as Record<string, unknown>
  const submission = extractSubmissionPayload(payload)

  return {
    uid: String(submission.uid ?? ''),
    plainText: typeof submission.plain_text === 'string' ? submission.plain_text : '',
    richText: parseRichTextValue(submission.rich_text),
    fileUrl: typeof submission.file_url === 'string' ? submission.file_url : '',
    fileOriginalFilename:
      typeof submission.file_original_filename === 'string' ? submission.file_original_filename : '',
    fileDescription: typeof submission.file_description === 'string' ? submission.file_description : '',
    quizAnswers: parseQuizAnswers(submission.quiz_answers),
    attemptCount: typeof submission.attempt_count === 'number' ? submission.attempt_count : 1,
    createdAt: typeof submission.created_at === 'string' ? submission.created_at : '',
    updatedAt: typeof submission.updated_at === 'string' ? submission.updated_at : '',
    grading: mapGrading(payload.grading, submission),
  }
}
