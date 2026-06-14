export type CourseModulePreviewVariant = 'mentor' | 'student' | 'admin'

export function getCourseModuleViewerBackHref(
  variant: CourseModulePreviewVariant,
  courseUid: string,
): string {
  if (variant === 'mentor') return `/mentor/courses/${courseUid}`
  if (variant === 'admin') return `/admin/courses/${courseUid}`
  return '/student/learning'
}
