import { ROUTES } from '@/lib/routes'

type BuildAssignmentHrefInput = {
  courseUid: string
  lessonUid?: string
  openAssignmentPane?: boolean
}

export function buildStudentAssignmentHref({
  courseUid,
  lessonUid,
  openAssignmentPane = true,
}: BuildAssignmentHrefInput): string {
  const basePath = ROUTES.viewModuleAndLessons(courseUid)
  if (!lessonUid) return basePath

  const params = new URLSearchParams({ lesson: lessonUid })
  if (openAssignmentPane) params.set('pane', 'assignment')

  return `${basePath}?${params.toString()}`
}
