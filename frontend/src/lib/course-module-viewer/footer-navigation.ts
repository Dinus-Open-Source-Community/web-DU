import type { LessonFooterNavAction } from '@/components/courses/module-viewer/LessonFooter'
import type { LessonEntry } from '@/lib/course-module-viewer/lesson-viewer-utils'
import { shouldOpenAssignmentAfterLesson } from '@/lib/lesson-assignment/navigation'
import type { CourseViewerPane } from '@/lib/lesson-assignment/types'
import type { CourseModulePreviewVariant } from '@/lib/course-module-viewer/navigation'
import type { LessonDetailItem } from '@/lib/types/lesson'

type FooterNavigationHandlers = {
  setViewerPane: (pane: CourseViewerPane) => void
  navigateToLessonEntry: (entry: LessonEntry) => void
  navigateToAssignmentEntry?: (entry: LessonEntry) => void
  navigateToLearningHome?: () => void
}

type FooterPreviousOptions = {
  previousEntryHasAssignment?: boolean
  previousEntryAssignmentTitle?: string
}

type FooterNextOptions = {
  hasAssignmentStep?: boolean
  assignmentTitle?: string
}

export function buildFooterPreviousAction(
  viewerPane: CourseViewerPane,
  displayedLesson: LessonDetailItem | null | undefined,
  previousEntry: LessonEntry | null,
  handlers: FooterNavigationHandlers,
  options: FooterPreviousOptions = {},
): LessonFooterNavAction | null {
  if (viewerPane === 'assignment-detail') {
    return {
      label: 'Sebelumnya',
      title: displayedLesson?.assignment?.title ?? 'Tugas',
      onClick: () => handlers.setViewerPane('assignment'),
    }
  }

  if (viewerPane === 'assignment') {
    return {
      label: 'Sebelumnya',
      title: displayedLesson?.title ?? 'Lesson',
      onClick: () => handlers.setViewerPane('lesson'),
    }
  }

  if (viewerPane === 'lesson' && previousEntry) {
    if (options.previousEntryHasAssignment) {
      return {
        label: 'Sebelumnya',
        title: options.previousEntryAssignmentTitle ?? 'Tugas',
        onClick: () => {
          if (handlers.navigateToAssignmentEntry) {
            handlers.navigateToAssignmentEntry(previousEntry)
          } else {
            handlers.navigateToLessonEntry(previousEntry)
          }
        },
      }
    }

    return {
      label: 'Sebelumnya',
      title: previousEntry.lesson.title,
      onClick: () => handlers.navigateToLessonEntry(previousEntry),
    }
  }

  return null
}

export function buildFooterNextAction(
  viewerPane: CourseViewerPane,
  variant: CourseModulePreviewVariant,
  displayedLesson: LessonDetailItem | null | undefined,
  nextEntry: LessonEntry | null,
  handlers: FooterNavigationHandlers,
  options: FooterNextOptions = {},
): LessonFooterNavAction | null {
  if (viewerPane === 'assignment-detail' && nextEntry) {
    return {
      label: 'Selanjutnya',
      title: nextEntry.lesson.title,
      onClick: () => handlers.navigateToLessonEntry(nextEntry),
    }
  }

  if (viewerPane === 'assignment' && nextEntry) {
    return {
      label: 'Selanjutnya',
      title: nextEntry.lesson.title,
      onClick: () => handlers.navigateToLessonEntry(nextEntry),
    }
  }

  const hasAssignmentStep =
    options.hasAssignmentStep ??
    (variant === 'student' && shouldOpenAssignmentAfterLesson(displayedLesson, viewerPane))

  if (viewerPane === 'lesson' && hasAssignmentStep) {
    return {
      label: 'Selanjutnya',
      title: options.assignmentTitle ?? displayedLesson?.assignment?.title ?? 'Tugas',
      onClick: () => handlers.setViewerPane('assignment'),
    }
  }

  if (viewerPane === 'lesson' && nextEntry) {
    return {
      label: 'Selanjutnya',
      title: nextEntry.lesson.title,
      onClick: () => handlers.navigateToLessonEntry(nextEntry),
    }
  }

  if (variant === 'student' && handlers.navigateToLearningHome) {
    return {
      label: 'Selanjutnya',
      title: 'Kembali ke Learning',
      onClick: handlers.navigateToLearningHome,
    }
  }

  return null
}

export function buildFooterActiveTitle(
  viewerPane: CourseViewerPane,
  displayedLesson: LessonDetailItem | null | undefined,
  activeLessonTitle: string | undefined,
  courseTitle: string,
): string {
  if (viewerPane === 'assignment-detail') return 'Detail pengumpulan'
  if (viewerPane === 'assignment') return displayedLesson?.assignment?.title ?? 'Tugas'
  return displayedLesson?.title ?? activeLessonTitle ?? courseTitle
}
