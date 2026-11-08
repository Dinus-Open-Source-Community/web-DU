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
  const basePath = ROUTES.viewModuleAndLessons(courseUid, lessonUid)
  if (!lessonUid) return basePath

  if (openAssignmentPane) {
    return `${basePath}?pane=assignment`
  }
  return basePath
}
