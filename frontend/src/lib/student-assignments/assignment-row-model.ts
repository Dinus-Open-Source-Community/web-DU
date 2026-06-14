import type { IMentorAssignmentSubmission, IMentorCourseAssignment } from '@/lib/types/course'
import type { StudentAssignmentRowKind, StudentAssignmentSectionItem } from '@/lib/types/student-assignments'
import type { DeadlineUrgency } from '@/lib/types/utils'

const DUE_SOON_MS = 72 * 60 * 60 * 1000

export type StudentAssignmentRow = StudentAssignmentSectionItem & {
  deadlineUrgency: DeadlineUrgency
  rowKind: StudentAssignmentRowKind
}

export function getEffectiveAssignmentStatus(
  assignment: IMentorCourseAssignment,
  now: Date,
): IMentorCourseAssignment['status'] {
  if (assignment.status === 'draft' || assignment.status === 'closed') return assignment.status

  const deadline = new Date(assignment.deadlineAt).getTime()
  if (assignment.autoCloseAfterDeadline && now.getTime() > deadline) return 'closed'

  return assignment.status
}

export function getDeadlineUrgency(assignment: IMentorCourseAssignment, now: Date): DeadlineUrgency {
  const effective = getEffectiveAssignmentStatus(assignment, now)
  if (effective === 'closed' || assignment.status === 'draft') {
    return effective === 'draft' ? 'ok' : 'closed'
  }

  const deadline = new Date(assignment.deadlineAt).getTime()
  const current = now.getTime()
  if (current > deadline) return 'overdue'
  if (deadline - current <= DUE_SOON_MS) return 'due_soon'
  return 'ok'
}

export function getRowKind(submission?: IMentorAssignmentSubmission | null): StudentAssignmentRowKind {
  if (!submission) return 'not_submitted'

  switch (submission.reviewStatus) {
    case 'pending_review':
      return 'pending_review'
    case 'graded':
      return 'graded'
    case 'returned':
      return 'returned'
  }
}

export function toStudentAssignmentRows(
  items: StudentAssignmentSectionItem[],
  now: Date,
): StudentAssignmentRow[] {
  return items
    .filter((item) => item.assignment.status !== 'draft')
    .map((item) => ({
      ...item,
      latestSubmission: item.latestSubmission ?? null,
      deadlineUrgency: getDeadlineUrgency(item.assignment, now),
      rowKind: getRowKind(item.latestSubmission),
    }))
    .sort(
      (a, b) =>
        new Date(a.assignment.deadlineAt).getTime() - new Date(b.assignment.deadlineAt).getTime(),
    )
}
