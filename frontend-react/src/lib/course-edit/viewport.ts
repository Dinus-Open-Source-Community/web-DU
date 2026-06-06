export const COURSE_EDIT_DESKTOP_BREAKPOINT_PX = 1024

export type CourseEditViewportMode = 'compact' | 'desktop'

export type CompactPane = 'outline' | 'editor'

export function resolveCourseEditViewportMode(
  viewportWidth: number,
): CourseEditViewportMode {
  return viewportWidth >= COURSE_EDIT_DESKTOP_BREAKPOINT_PX ? 'desktop' : 'compact'
}

export function shouldShowOutlinePane(
  viewportMode: CourseEditViewportMode,
  compactPane: CompactPane,
): boolean {
  return viewportMode === 'desktop' || compactPane === 'outline'
}

export function shouldShowEditorPane(
  viewportMode: CourseEditViewportMode,
  compactPane: CompactPane,
  hasActiveLesson: boolean,
): boolean {
  if (viewportMode === 'desktop') return true
  return compactPane === 'editor' && hasActiveLesson
}
