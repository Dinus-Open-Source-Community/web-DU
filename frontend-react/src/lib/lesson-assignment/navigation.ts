import type { LessonDetailItem } from '@/lib/types/lesson'

import { isAssignmentVisibleToStudent } from './submission-status'
import type { CourseViewerPane } from './types'

export function lessonHasStudentAssignment(lesson?: LessonDetailItem | null) {
  return isAssignmentVisibleToStudent(lesson?.assignment)
}

export function shouldOpenAssignmentAfterLesson(
  lesson: LessonDetailItem | null | undefined,
  pane: CourseViewerPane,
) {
  return pane === 'lesson' && lessonHasStudentAssignment(lesson)
}
