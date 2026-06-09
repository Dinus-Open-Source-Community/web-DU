import { ROUTES } from '@/lib/routes'

export type StaffAssignmentRole = 'admin' | 'mentor'

export function buildAssignmentSubmissionsHref(
  role: StaffAssignmentRole,
  courseUid: string,
  lessonUid: string,
): string {
  return role === 'admin'
    ? ROUTES.admin.assignmentSubmissions(courseUid, lessonUid)
    : ROUTES.mentor.assignmentSubmissions(courseUid, lessonUid)
}

export function buildAssignmentSubmissionDetailHref(
  role: StaffAssignmentRole,
  courseUid: string,
  lessonUid: string,
  submissionUid: string,
): string {
  return role === 'admin'
    ? ROUTES.admin.assignmentSubmissionDetail(courseUid, lessonUid, submissionUid)
    : ROUTES.mentor.assignmentSubmissionDetail(courseUid, lessonUid, submissionUid)
}

export function buildCourseDetailAssignmentsHref(
  role: StaffAssignmentRole,
  courseUid: string,
): string {
  const base =
    role === 'admin'
      ? ROUTES.admin.detailCourseAdmin(courseUid)
      : ROUTES.mentor.detailCourseMentor(courseUid)

  return `${base}?tab=assignments`
}
