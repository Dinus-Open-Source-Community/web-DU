import type { AssignmentSubmissionSummary } from '@/lib/course-detail/assignment-overview-types'
import type { ICourseStaffSubmission } from '@/lib/types/features/course-detail-assignments'

export function mapStaffSubmissionToOverviewSummary(
  submission: ICourseStaffSubmission,
): AssignmentSubmissionSummary {
  return {
    studentUid: submission.student.uid,
    gradedAt: submission.gradedAt,
  }
}

export function mapStaffSubmissionsToOverviewSummaries(
  submissions: ICourseStaffSubmission[],
): AssignmentSubmissionSummary[] {
  return submissions.map(mapStaffSubmissionToOverviewSummary)
}
