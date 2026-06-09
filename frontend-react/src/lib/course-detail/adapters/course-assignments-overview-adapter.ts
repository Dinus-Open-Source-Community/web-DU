import type {
  AssignmentSubmissionSummary,
  CourseAssignmentBulkItem,
  CourseAssignmentOverviewSource,
} from '@/lib/course-detail/assignment-overview-types'
import { toMinimalLessonAssignment } from '@/lib/course-detail/map-course-assignment-bulk'
import { mapStaffSubmissionsToOverviewSummaries } from '@/lib/course-detail/map-staff-submission-overview'
import { fetchLessonAssignmentSubmissions } from '@/services/lesson-assignment-submission'

export async function fetchSubmissionSummariesForAssignment(
  assignment: CourseAssignmentBulkItem,
): Promise<AssignmentSubmissionSummary[]> {
  const submissions = await fetchLessonAssignmentSubmissions(assignment.lessonUid, {
    lessonTitle: assignment.lessonTitle,
    moduleTitle: assignment.moduleTitle,
    assignment: toMinimalLessonAssignment(assignment),
  })

  return mapStaffSubmissionsToOverviewSummaries(submissions)
}

export function buildOverviewSource(
  assignment: CourseAssignmentBulkItem,
  submissions: readonly AssignmentSubmissionSummary[],
  isSubmissionsLoading: boolean,
): CourseAssignmentOverviewSource {
  return {
    lessonUid: assignment.lessonUid,
    lessonTitle: assignment.lessonTitle,
    moduleTitle: assignment.moduleTitle,
    moduleOrderIndex: assignment.moduleOrderIndex,
    lessonOrderIndex: assignment.lessonOrderIndex,
    assignmentUid: assignment.uid,
    assignmentTitle: assignment.title,
    taskType: assignment.taskType,
    submissionCount: assignment.submissionCount,
    submissions,
    isSubmissionsLoading,
  }
}

export function buildOverviewSourcesFromBulk(
  assignments: readonly CourseAssignmentBulkItem[],
  submissionResults: ReadonlyMap<string, readonly AssignmentSubmissionSummary[]>,
  loadingLessonUids: ReadonlySet<string>,
): CourseAssignmentOverviewSource[] {
  return assignments.map((assignment) => {
    const needsSubmissions = assignment.submissionCount > 0
    const submissions = submissionResults.get(assignment.lessonUid) ?? []
    const isSubmissionsLoading = needsSubmissions && loadingLessonUids.has(assignment.lessonUid)

    return buildOverviewSource(assignment, submissions, isSubmissionsLoading)
  })
}
