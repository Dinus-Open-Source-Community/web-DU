import type { IMentorAssignmentSubmission, IMentorCourseAssignment } from '@/lib/types/course'
import { getDeadlineUrgency, getEffectiveAssignmentStatus } from '@/lib/func/fungsi'

export function assignmentLifecycleBadgeVariant(
  assignment: IMentorCourseAssignment,
  effectiveClosed: boolean,
): 'assignmentDraft' | 'assignmentPublished' | 'assignmentClosed' {
  if (assignment.status === 'draft') return 'assignmentDraft'
  if (effectiveClosed || assignment.status === 'closed') return 'assignmentClosed'
  return 'assignmentPublished'
}

export function deadlineUrgencyBadgeVariant(
  urgency: ReturnType<typeof getDeadlineUrgency>,
): 'deadlineOverdue' | 'deadlineDueSoon' | null {
  if (urgency === 'closed') return null
  if (urgency === 'overdue') return 'deadlineOverdue'
  if (urgency === 'due_soon') return 'deadlineDueSoon'
  return null
}

export function submissionReviewBadgeVariant(
  status: IMentorAssignmentSubmission['reviewStatus'],
): 'reviewPending' | 'reviewGraded' | 'reviewReturned' {
  switch (status) {
    case 'pending_review':
      return 'reviewPending'
    case 'graded':
      return 'reviewGraded'
    case 'returned':
      return 'reviewReturned'
  }
}

export function getAssignmentRowUrgencyClass(
  assignment: IMentorCourseAssignment,
  now: Date,
): string | undefined {
  const urgency = getDeadlineUrgency(assignment, now)
  if (urgency === 'due_soon') return 'border-l-4 border-l-amber-400 bg-amber-50/40'
  if (urgency === 'overdue') return 'border-l-4 border-l-rose-300 bg-rose-50/35'
  return undefined
}

export function isAssignmentEffectivelyClosed(assignment: IMentorCourseAssignment, now: Date): boolean {
  return getEffectiveAssignmentStatus(assignment, now) === 'closed'
}
