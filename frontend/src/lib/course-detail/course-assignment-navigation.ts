import { dashboardMenu } from '@/lib/routes'

export type StaffAssignmentRole = 'admin' | 'mentor'

export function buildAssignmentSubmissionsHref(
  _role: StaffAssignmentRole,
  courseUid: string,
  lessonUid: string,
): string {
  return dashboardMenu.assignmentSubmissions(courseUid, lessonUid)
}

export function buildAssignmentSubmissionDetailHref(
  _role: StaffAssignmentRole,
  courseUid: string,
  lessonUid: string,
  submissionUid: string,
): string {
  return dashboardMenu.assignmentSubmissionDetail(courseUid, lessonUid, submissionUid)
}

export function buildCourseDetailAssignmentsHref(
  _role: StaffAssignmentRole,
  courseUid: string,
): string {
  return `${dashboardMenu.courseDetail(courseUid)}?tab=assignments`
}
