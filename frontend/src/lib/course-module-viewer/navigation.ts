import { dashboardMenu } from '@/lib/routes'

export type CourseModulePreviewVariant = 'student' | 'mentor' | 'admin'

export function getCourseModuleViewerBackHref(
  variant: CourseModulePreviewVariant,
  courseUid: string,
): string {
  if (variant === 'mentor' || variant === 'admin') {
    return dashboardMenu.courseDetail(courseUid)
  }
  return dashboardMenu.learning
}
