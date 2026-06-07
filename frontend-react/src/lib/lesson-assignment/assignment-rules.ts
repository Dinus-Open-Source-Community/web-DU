import type { LessonDetailAssignment } from '@/lib/types/lesson'

import type { LessonAssignmentSubmissionRecord } from './types'

/** Selaras `assertAssignmentAcceptsSubmission` + `maxSubmissionAttempts` di backend. */
export function getAssignmentDeadlineAt(assignment: LessonDetailAssignment): string {
  return assignment.deadline_at
}

export function parseAssignmentDeadlineMs(deadlineAt: string): number | null {
  if (!deadlineAt.trim()) return null

  const parsed = new Date(deadlineAt).getTime()
  return Number.isNaN(parsed) ? null : parsed
}

/** Selaras `now.After(a.DeadlineAt)` — deadline masih valid saat waktu persis sama. */
export function isAssignmentDeadlinePassed(
  assignment: LessonDetailAssignment,
  now = new Date(),
): boolean {
  const deadlineMs = parseAssignmentDeadlineMs(assignment.deadline_at)
  if (deadlineMs == null) return true
  return now.getTime() > deadlineMs
}

/** Selaras `assertAssignmentAcceptsSubmission` backend. */
export function isAssignmentAcceptingSubmissions(
  assignment: LessonDetailAssignment,
  now = new Date(),
): boolean {
  if (assignment.status === 'DITUTUP') return false
  if (assignment.status !== 'TERBIT') return false
  return !isAssignmentDeadlinePassed(assignment, now)
}

/** Selaras `maxSubmissionAttempts` di backend. */
export function getMaxSubmissionAttempts(assignment: LessonDetailAssignment): number {
  if (!assignment.allow_resubmit) return 1
  if (assignment.max_resubmit_count == null || assignment.max_resubmit_count < 1) return 1
  return 1 + assignment.max_resubmit_count
}

export function hasRemainingSubmissionAttempts(
  assignment: LessonDetailAssignment,
  submission: LessonAssignmentSubmissionRecord | null,
): boolean {
  if (!submission) return true
  return submission.attemptCount < getMaxSubmissionAttempts(assignment)
}

export function getAssignmentSubmissionBlockReason(
  assignment: LessonDetailAssignment,
  submission: LessonAssignmentSubmissionRecord | null,
  now = new Date(),
): string | null {
  if (assignment.status === 'DITUTUP') {
    return 'Tugas sudah ditutup.'
  }

  if (assignment.status !== 'TERBIT') {
    return 'Tugas belum diterbitkan.'
  }

  if (isAssignmentDeadlinePassed(assignment, now)) {
    return 'Batas waktu pengumpulan sudah lewat.'
  }

  if (submission && !hasRemainingSubmissionAttempts(assignment, submission)) {
    return 'Batas percobaan pengumpulan sudah habis.'
  }

  if (submission && !assignment.allow_resubmit) {
    return 'Pengumpulan ulang tidak diizinkan untuk tugas ini.'
  }

  return null
}

export function canStartAssignmentWork(
  assignment: LessonDetailAssignment,
  submission: LessonAssignmentSubmissionRecord | null,
  now = new Date(),
): boolean {
  return getAssignmentSubmissionBlockReason(assignment, submission, now) === null
}

export function isAssignmentSubmissionOpen(
  assignment: LessonDetailAssignment,
  now = new Date(),
): boolean {
  return isAssignmentAcceptingSubmissions(assignment, now)
}

export function canViewSubmissionDetail(submission: LessonAssignmentSubmissionRecord | null) {
  return submission !== null
}

export function formatSubmissionAttemptUsage(attemptCount: number, maxAttempts: number) {
  return `${attemptCount} / ${maxAttempts}`
}

export function getResubmitPolicyLabel(assignment: LessonDetailAssignment) {
  if (!assignment.allow_resubmit) {
    return 'Pengumpulan ulang tidak diizinkan (1x)'
  }

  const maxAttempts = getMaxSubmissionAttempts(assignment)
  const resubmitSlots = maxAttempts - 1
  return `Maks. ${maxAttempts}x pengumpulan (${resubmitSlots}x ulang)`
}

export function getAllowedSubmissionMethodsLabel(assignment: LessonDetailAssignment) {
  const methods: string[] = []

  if (assignment.allow_plain_text_submission) methods.push('Teks')
  if (assignment.allow_rich_text_submission) methods.push('Rich text')
  if (assignment.allow_file_submission) methods.push('File')

  return methods.length > 0 ? methods.join(', ') : 'Tidak ada metode aktif'
}

export function getAssignmentTaskTypeLabel(assignment: LessonDetailAssignment) {
  return assignment.task_type === 'quiz' ? 'Kuis' : 'Tugas'
}
