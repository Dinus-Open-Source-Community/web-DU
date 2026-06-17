import type {
  LessonAssignmentGradingApiRaw,
  LessonAssignmentSubmissionApiRaw,
  LessonAssignmentSubmissionBundleApiRaw,
} from '@/lib/lesson-assignment/api-types'
import type { IRichTextEnvelope } from '@/lib/types/rich-text'
import type {
  LessonAssignmentGrading,
  LessonAssignmentSubmissionBundle,
  LessonAssignmentSubmissionRecord,
  QuizAnswersMap,
} from './types'

function parseRichTextValue(raw: IRichTextEnvelope | string | null | undefined): IRichTextEnvelope | string | null {
  if (raw == null) return null
  if (typeof raw === 'string') return raw
  if (typeof raw.contentHtml === 'string') return raw
  return null
}

function parseQuizAnswers(raw: QuizAnswersMap | undefined): QuizAnswersMap {
  if (!raw || typeof raw !== 'object') return {}

  const answers: QuizAnswersMap = {}
  for (const [questionId, value] of Object.entries(raw)) {
    if (typeof value === 'string' && value.trim()) {
      answers[questionId] = value.trim()
    }
  }

  return answers
}

function mapGrading(
  raw: LessonAssignmentGradingApiRaw | undefined,
  submissionRaw?: LessonAssignmentSubmissionApiRaw,
): LessonAssignmentGrading {
  const grading = raw ?? {}
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

function mapSubmissionEntity(
  submission: LessonAssignmentSubmissionApiRaw,
  options?: { attemptNumber?: number; submittedAt?: string },
): LessonAssignmentSubmissionRecord {
  const attemptCount =
    options?.attemptNumber ??
    (typeof submission.attempt_count === 'number' ? submission.attempt_count : 1)

  const createdAt =
    options?.submittedAt ??
    (typeof submission.created_at === 'string' ? submission.created_at : '')

  const updatedAt =
    options?.submittedAt ??
    (typeof submission.updated_at === 'string'
      ? submission.updated_at
      : typeof submission.created_at === 'string'
        ? submission.created_at
        : '')

  return {
    uid: String(submission.uid ?? ''),
    plainText: typeof submission.plain_text === 'string' ? submission.plain_text : '',
    richText: parseRichTextValue(submission.rich_text),
    fileUrl: typeof submission.file_url === 'string' ? submission.file_url : '',
    fileOriginalFilename:
      typeof submission.file_original_filename === 'string' ? submission.file_original_filename : '',
    fileDescription: typeof submission.file_description === 'string' ? submission.file_description : '',
    quizAnswers: parseQuizAnswers(submission.quiz_answers),
    attemptCount,
    createdAt,
    updatedAt,
    grading: mapGrading(submission.grading, submission),
  }
}

function mapSubmissionAttemptItem(
  attempt: LessonAssignmentSubmissionApiRaw,
  submissionUid: string,
): LessonAssignmentSubmissionRecord {
  const attemptNumber =
    typeof attempt.attempt_number === 'number' ? attempt.attempt_number : 1

  const submittedAt =
    typeof attempt.submitted_at === 'string'
      ? attempt.submitted_at
      : typeof attempt.created_at === 'string'
        ? attempt.created_at
        : ''

  return mapSubmissionEntity(
    {
      ...attempt,
      uid: attempt.uid ?? `${submissionUid}-${attemptNumber}`,
    },
    {
      attemptNumber,
      submittedAt,
    },
  )
}

function mapSingleSubmissionPayload(raw: LessonAssignmentSubmissionBundleApiRaw): LessonAssignmentSubmissionRecord {
  const submission: LessonAssignmentSubmissionApiRaw = raw.submission ?? {
    uid: raw.submission_uid,
    attempt_count: raw.latest_attempt_number,
  }
  return mapSubmissionEntity(submission)
}

export function mapLessonAssignmentSubmissionBundle(
  raw: LessonAssignmentSubmissionBundleApiRaw,
): LessonAssignmentSubmissionBundle {
  if (Array.isArray(raw.submissions) && raw.submissions.length > 0) {
    const submissionUid = String(raw.submission_uid ?? '')
    const attempts = raw.submissions.map((item) =>
      mapSubmissionAttemptItem(item, submissionUid),
    )
    const latest = attempts[attempts.length - 1]

    return {
      submissionUid,
      latestAttemptNumber:
        typeof raw.latest_attempt_number === 'number'
          ? raw.latest_attempt_number
          : latest.attemptCount,
      maxAttempts: typeof raw.max_attempts === 'number' ? raw.max_attempts : null,
      totalAttempts:
        typeof raw.total_attempts === 'number' ? raw.total_attempts : attempts.length,
      latest,
      attempts,
    }
  }

  const latest = mapSingleSubmissionPayload(raw)

  return {
    submissionUid: latest.uid,
    latestAttemptNumber: latest.attemptCount,
    maxAttempts: null,
    totalAttempts: 1,
    latest,
    attempts: [latest],
  }
}

export function mapLessonAssignmentSubmissionResponse(
  raw: LessonAssignmentSubmissionBundleApiRaw,
): LessonAssignmentSubmissionRecord {
  return mapLessonAssignmentSubmissionBundle(raw).latest
}
