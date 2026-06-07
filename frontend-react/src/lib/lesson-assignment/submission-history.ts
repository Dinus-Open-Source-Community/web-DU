import { format } from 'date-fns'
import { id } from 'date-fns/locale'

import type { IQuiz, LessonDetailAssignment } from '@/lib/types/lesson'

import {
  formatSubmissionAttemptUsage,
  getAllowedSubmissionMethodsLabel,
  getAssignmentTaskTypeLabel,
  getMaxSubmissionAttempts,
  getResubmitPolicyLabel,
} from './assignment-rules'
import { formatSubmissionSubmittedAt } from './submission-status'
import type { LessonAssignmentSubmissionRecord, StudentSubmissionPhase } from './types'

export type SubmissionPassOutcome = 'passed' | 'failed' | 'pending' | 'graded' | 'unavailable'

export type AssignmentHistoryPolicyViewModel = {
  taskTypeLabel: string
  resubmitPolicyLabel: string
  submissionMethodsLabel: string
  passingScoreLabel: string | null
  maxAttempts: number
}

export type SubmissionHistoryRowViewModel = {
  id: string
  submittedAtLabel: string
  gradedAtLabel: string | null
  attemptLabel: string
  scoreLabel: string
  quizAccuracyLabel: string | null
  gradingTypeLabel: string | null
  passOutcome: SubmissionPassOutcome
  passOutcomeLabel: string | null
  showPassResult: boolean
  showScore: boolean
  hasFeedback: boolean
  isQuiz: boolean
}

export type SubmissionHistoryViewModel = {
  phase: StudentSubmissionPhase
  workflowStatusLabel: string
  submittedAtLabel: string | null
  scorePercent: number | null
  scoreLabel: string | null
  passingScore: number | null
  passingScoreLabel: string | null
  passOutcome: SubmissionPassOutcome
  passOutcomeLabel: string | null
  attemptCount: number | null
  showPassResult: boolean
  showScore: boolean
}

type SubmissionStatusDisplay = {
  outcome: SubmissionPassOutcome
  label: string | null
  show: boolean
}

function getPassingScore(assignment: LessonDetailAssignment): number | null {
  if (assignment.task_type !== 'quiz') return null

  const quiz = assignment.quiz_payload as IQuiz | null
  return quiz?.passingScore ?? 70
}

function formatScorePercent(value: number) {
  const rounded = Math.round(value * 10) / 10
  return Number.isInteger(rounded) ? `${rounded}%` : `${rounded.toFixed(1)}%`
}

function formatGradedAt(raw: string | null) {
  if (!raw) return null
  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) return null
  return format(parsed, "d MMM yyyy, HH:mm", { locale: id })
}

function getWorkflowStatusLabel(
  assignment: LessonDetailAssignment,
  phase: StudentSubmissionPhase,
): string {
  if (phase === 'not_submitted') return 'Belum dikumpulkan'
  if (phase === 'pending_review') {
    return assignment.task_type === 'text' ? 'Dikoreksi' : 'Menunggu penilaian'
  }
  return 'Sudah dinilai'
}

function resolveQuizPassOutcome(
  assignment: LessonDetailAssignment,
  submission: LessonAssignmentSubmissionRecord,
): SubmissionPassOutcome {
  if (submission.grading.passed === true) return 'passed'
  if (submission.grading.passed === false) return 'failed'

  const passingScore = getPassingScore(assignment)
  const score = submission.grading.scorePercent
  if (passingScore != null && score != null) {
    return score >= passingScore ? 'passed' : 'failed'
  }

  return 'unavailable'
}

function getQuizPassOutcomeLabel(outcome: SubmissionPassOutcome): string | null {
  if (outcome === 'passed') return 'Lulus'
  if (outcome === 'failed') return 'Tidak Lulus'
  return null
}

function resolveSubmissionStatusDisplay(
  assignment: LessonDetailAssignment,
  submission: LessonAssignmentSubmissionRecord,
  phase: StudentSubmissionPhase,
): SubmissionStatusDisplay {
  if (phase === 'pending_review') {
    return {
      outcome: 'pending',
      label: assignment.task_type === 'text' ? 'Dikoreksi' : 'Menunggu penilaian',
      show: true,
    }
  }

  if (assignment.task_type === 'quiz') {
    const outcome = resolveQuizPassOutcome(assignment, submission)
    return {
      outcome,
      label: getQuizPassOutcomeLabel(outcome),
      show: outcome !== 'unavailable',
    }
  }

  if (submission.grading.passed === true) {
    return { outcome: 'passed', label: 'Lulus', show: true }
  }

  if (submission.grading.passed === false) {
    return { outcome: 'failed', label: 'Tidak Lulus', show: true }
  }

  if (submission.grading.isGraded || phase === 'graded') {
    return { outcome: 'graded', label: 'Sudah dinilai', show: true }
  }

  return { outcome: 'unavailable', label: null, show: false }
}

function buildQuizAccuracyLabel(submission: LessonAssignmentSubmissionRecord) {
  const { quizCorrectCount, quizQuestionCount } = submission.grading
  if (quizCorrectCount == null || quizQuestionCount == null) return null
  return `${quizCorrectCount} / ${quizQuestionCount}`
}

function buildGradingTypeLabel(
  assignment: LessonDetailAssignment,
  submission: LessonAssignmentSubmissionRecord,
  phase: StudentSubmissionPhase,
) {
  if (phase === 'pending_review') return null
  if (assignment.task_type === 'quiz') return 'Otomatis'
  if (submission.grading.isGraded) return submission.grading.isAutoGraded ? 'Otomatis' : 'Manual'
  return null
}

export function buildAssignmentHistoryPolicy(
  assignment: LessonDetailAssignment,
): AssignmentHistoryPolicyViewModel {
  const passingScore = getPassingScore(assignment)

  return {
    taskTypeLabel: getAssignmentTaskTypeLabel(assignment),
    resubmitPolicyLabel: getResubmitPolicyLabel(assignment),
    submissionMethodsLabel: getAllowedSubmissionMethodsLabel(assignment),
    passingScoreLabel: passingScore != null ? `Syarat lulus ${passingScore}%` : null,
    maxAttempts: getMaxSubmissionAttempts(assignment),
  }
}

export function buildSubmissionHistoryViewModel(
  assignment: LessonDetailAssignment,
  submission: LessonAssignmentSubmissionRecord | null,
  phase: StudentSubmissionPhase,
): SubmissionHistoryViewModel {
  const passingScore = getPassingScore(assignment)

  if (!submission) {
    return {
      phase,
      workflowStatusLabel: getWorkflowStatusLabel(assignment, phase),
      submittedAtLabel: null,
      scorePercent: null,
      scoreLabel: null,
      passingScore,
      passingScoreLabel: passingScore != null ? `Min. ${passingScore}%` : null,
      passOutcome: 'pending',
      passOutcomeLabel: null,
      attemptCount: null,
      showPassResult: false,
      showScore: false,
    }
  }

  const scorePercent = submission.grading.scorePercent
  const status = resolveSubmissionStatusDisplay(assignment, submission, phase)
  const showScore = scorePercent != null && phase !== 'pending_review'

  return {
    phase,
    workflowStatusLabel: getWorkflowStatusLabel(assignment, phase),
    submittedAtLabel: formatSubmissionSubmittedAt(submission),
    scorePercent,
    scoreLabel: showScore && scorePercent != null ? formatScorePercent(scorePercent) : null,
    passingScore,
    passingScoreLabel: passingScore != null ? `Min. ${passingScore}%` : null,
    passOutcome: status.outcome,
    passOutcomeLabel: status.label,
    attemptCount: submission.attemptCount,
    showPassResult: status.show,
    showScore,
  }
}

export function buildSubmissionHistoryRows(
  assignment: LessonDetailAssignment,
  submission: LessonAssignmentSubmissionRecord | null,
  phase: StudentSubmissionPhase,
): SubmissionHistoryRowViewModel[] {
  if (!submission) return []

  const history = buildSubmissionHistoryViewModel(assignment, submission, phase)
  const maxAttempts = getMaxSubmissionAttempts(assignment)
  const isQuiz = assignment.task_type === 'quiz'

  return [
    {
      id: submission.uid,
      submittedAtLabel: history.submittedAtLabel ?? '-',
      gradedAtLabel: formatGradedAt(submission.grading.gradedAt),
      attemptLabel: formatSubmissionAttemptUsage(submission.attemptCount, maxAttempts),
      scoreLabel: history.showScore && history.scoreLabel ? history.scoreLabel : '-',
      quizAccuracyLabel: isQuiz ? buildQuizAccuracyLabel(submission) : null,
      gradingTypeLabel: buildGradingTypeLabel(assignment, submission, phase),
      passOutcome: history.passOutcome,
      passOutcomeLabel: history.passOutcomeLabel,
      showPassResult: history.showPassResult,
      showScore: history.showScore,
      hasFeedback: submission.grading.hasFeedback,
      isQuiz,
    },
  ]
}
