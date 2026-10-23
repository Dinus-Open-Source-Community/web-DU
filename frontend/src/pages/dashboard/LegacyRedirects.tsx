import { Navigate, useParams } from 'react-router-dom'

import { dashboardMenu, ROUTES } from '@/lib/routes'

type ParamMap = Record<string, string | undefined>

function interpolate(template: string, params: ParamMap) {
  return template.replace(/:([A-Za-z0-9_]+)/g, (_, key: string) => params[key] ?? '')
}

export function LegacyRedirect({ template }: { template: string }) {
  const params = useParams()
  return <Navigate to={interpolate(template, params)} replace />
}

/** Path lama → template path baru (parameter `:id` sama di kedua sisi). */
export const LEGACY_DASHBOARD_REDIRECTS: Array<{ path: string; template: string }> = [
  { path: '/profile', template: ROUTES.profile },
  { path: '/admin/dashboard', template: '/dashboard' },
  { path: '/mentor/dashboard', template: '/dashboard' },
  { path: '/student/dashboard', template: '/dashboard' },
  { path: '/admin/users/students', template: dashboardMenu.users.students },
  { path: '/admin/users/students/:userUid', template: dashboardMenu.users.studentDetail(':userUid') },
  { path: '/admin/users/mentors', template: dashboardMenu.users.mentors },
  { path: '/admin/users/mentors/:userUid', template: dashboardMenu.users.mentorDetail(':userUid') },
  { path: '/admin/users/administrators', template: dashboardMenu.users.administrators },
  {
    path: '/admin/users/administrators/:userUid',
    template: dashboardMenu.users.administratorDetail(':userUid'),
  },
  { path: '/admin/courses', template: dashboardMenu.courses },
  { path: '/admin/course-categories', template: dashboardMenu.courseCategories },
  { path: '/admin/course-types', template: dashboardMenu.courseTypes },
  { path: '/admin/courses/:courseUid', template: dashboardMenu.courseDetail(':courseUid') },
  { path: '/admin/courses/:courseUid/edit', template: dashboardMenu.courseEdit(':courseUid') },
  {
    path: '/admin/courses/:courseUid/assignments/:lessonUid',
    template: dashboardMenu.assignmentSubmissions(':courseUid', ':lessonUid'),
  },
  {
    path: '/admin/courses/:courseUid/assignments/:lessonUid/submissions/:submissionUid',
    template: dashboardMenu.assignmentSubmissionDetail(':courseUid', ':lessonUid', ':submissionUid'),
  },
  { path: '/admin/reviews-and-qa', template: dashboardMenu.reviewsAndQa },
  { path: '/mentor/courses', template: dashboardMenu.courses },
  { path: '/mentor/courses/:courseUid', template: dashboardMenu.courseDetail(':courseUid') },
  { path: '/mentor/courses/:courseUid/edit', template: dashboardMenu.courseEdit(':courseUid') },
  {
    path: '/mentor/courses/:courseUid/assignments',
    template: dashboardMenu.courseAssignmentHub(':courseUid'),
  },
  {
    path: '/mentor/courses/:courseUid/assignments/:lessonUid',
    template: dashboardMenu.assignmentSubmissions(':courseUid', ':lessonUid'),
  },
  {
    path: '/mentor/courses/:courseUid/assignments/:lessonUid/submissions/:submissionUid',
    template: dashboardMenu.assignmentSubmissionDetail(':courseUid', ':lessonUid', ':submissionUid'),
  },
  { path: '/student/learning', template: dashboardMenu.learning },
  { path: '/student/learning/course/:courseUid', template: dashboardMenu.learningCourse(':courseUid') },
  { path: '/student/assignments', template: dashboardMenu.assignments },
  { path: '/student/browse', template: dashboardMenu.learning },
  { path: '/student/certificates', template: dashboardMenu.certificates },
]
