import { format } from 'date-fns'
import { id } from 'date-fns/locale'

import type { LessonDetailAssignment } from '@/lib/types/lesson'

import type { LessonAssignmentSubmissionRecord, StudentSubmissionPhase } from './types'

export type SubmissionStatusBadgeTone = 'neutral' | 'pending' | 'success' | 'quiz'

export function isAssignmentVisibleToStudent(assignment?: LessonDetailAssignment | null) {
  if (!assignment) return false
  return assignment.status === 'TERBIT' || assignment.status === 'DITUTUP'
}

export function deriveSubmissionPhase(
  assignment: LessonDetailAssignment,
  submission: LessonAssignmentSubmissionRecord | null,
): StudentSubmissionPhase {
  if (!submission) return 'not_submitted'
  return deriveAttemptPhase(assignment, submission)
}

/** Fase per attempt — dipakai riwayat pengumpulan multi-attempt. */
export function deriveAttemptPhase(
  assignment: LessonDetailAssignment,
  attempt: LessonAssignmentSubmissionRecord,
): StudentSubmissionPhase {
  if (assignment.task_type === 'quiz') {
    return 'graded'
  }

  if (attempt.grading.isGraded) {
    return 'graded'
  }

  return 'pending_review'
}

export function getSubmissionStatusLabel(
  assignment: LessonDetailAssignment,
  phase: StudentSubmissionPhase,
) {
  if (phase === 'not_submitted') return 'Belum dikumpulkan'
  if (phase === 'pending_review') {
    return assignment.task_type === 'text' ? 'Dikoreksi' : 'Menunggu penilaian'
  }
  return 'Sudah dinilai'
}

export function getSubmissionStatusBadgeMeta(
  assignment: LessonDetailAssignment,
  phase: StudentSubmissionPhase,
): { label: string; tone: SubmissionStatusBadgeTone } {
  if (phase === 'not_submitted') {
    return { label: 'Belum dikumpulkan', tone: 'neutral' }
  }

  if (phase === 'pending_review') {
    return {
      label: assignment.task_type === 'text' ? 'Dikoreksi' : 'Menunggu penilaian',
      tone: 'pending',
    }
  }

  if (assignment.task_type === 'quiz') {
    return { label: 'Sudah dinilai', tone: 'success' }
  }

  return { label: 'Sudah dinilai', tone: 'success' }
}

export function formatSubmissionSubmittedAt(submission: LessonAssignmentSubmissionRecord) {
  const submittedAt = submission.updatedAt || submission.createdAt
  return format(new Date(submittedAt), "d MMM yyyy, HH:mm", { locale: id })
}
