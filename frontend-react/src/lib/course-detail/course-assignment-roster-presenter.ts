import type { IMentorCourseStudent } from '@/lib/types/course'
import type {
  AssignmentRosterStatusFilter,
  AssignmentSubmissionStatus,
  ICourseAssignmentRosterRow,
  ICourseStaffSubmission,
} from '@/lib/types/features/course-detail-assignments'

function indexLatestSubmissionsByStudent(
  submissions: ICourseStaffSubmission[],
): Map<string, ICourseStaffSubmission> {
  const byStudentUid = new Map<string, ICourseStaffSubmission>()

  for (const submission of submissions) {
    const studentUid = submission.student.uid
    if (!studentUid) continue

    const existing = byStudentUid.get(studentUid)
    if (!existing) {
      byStudentUid.set(studentUid, submission)
      continue
    }

    const existingTime = new Date(existing.submittedAt).getTime()
    const nextTime = new Date(submission.submittedAt).getTime()
    if (nextTime >= existingTime) {
      byStudentUid.set(studentUid, submission)
    }
  }

  return byStudentUid
}

export function buildAssignmentRoster(
  students: IMentorCourseStudent[],
  submissions: ICourseStaffSubmission[],
): ICourseAssignmentRosterRow[] {
  const submissionByStudentUid = indexLatestSubmissionsByStudent(submissions)

  return students
    .map((student) => {
      const submission = submissionByStudentUid.get(student.student_uid) ?? null
      const status: AssignmentSubmissionStatus = submission
        ? 'submitted'
        : 'not_submitted'

      return {
        student,
        submission,
        status,
      }
    })
    .sort((left, right) =>
      left.student.student_name.localeCompare(right.student.student_name, 'id'),
    )
}

export function filterRosterBySearch(
  rows: ICourseAssignmentRosterRow[],
  searchQuery: string,
): ICourseAssignmentRosterRow[] {
  const normalized = searchQuery.trim().toLowerCase()
  if (!normalized) return rows

  return rows.filter((row) => row.student.student_name.toLowerCase().includes(normalized))
}

export function filterRosterByStatus(
  rows: ICourseAssignmentRosterRow[],
  statusFilter: AssignmentRosterStatusFilter,
): ICourseAssignmentRosterRow[] {
  if (statusFilter === 'all') return rows
  if (statusFilter === 'submitted') {
    return rows.filter((row) => row.status === 'submitted')
  }
  return rows.filter((row) => row.status === 'not_submitted')
}
