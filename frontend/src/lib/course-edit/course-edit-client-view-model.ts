export type { CourseEditControllerView as CourseEditClientViewModel } from '@/hooks/use-course-edit-controller'

import type { CourseEditControllerView } from '@/hooks/use-course-edit-controller'

export type CourseEditClientShellProps = {
  view: CourseEditControllerView
  isAdmin: boolean
}
