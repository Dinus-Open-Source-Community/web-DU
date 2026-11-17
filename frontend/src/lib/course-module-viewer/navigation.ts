import { dashboardMenu } from '@/lib/routes'

export type CourseModulePreviewVariant =
  | 'student'
  | 'mentor'
  | 'admin'
  | 'super_admin'

export function getCourseModuleViewerBackHref(
  variant: CourseModulePreviewVariant,
  courseUid: string,
  pathname?: string,
): string {
  const isStaffRoute = pathname ? pathname.startsWith('/course/') : false
  const isStaffRole =
    variant === 'mentor' || variant === 'admin' || variant === 'super_admin'

  if (isStaffRoute || isStaffRole) {
    return courseUid ? dashboardMenu.courseDetail(courseUid) : dashboardMenu.courses
  }
  return dashboardMenu.learning
}

