import { FileText, Film } from 'lucide-react'

import type { AppTheme } from '@/lib/theme/app-theme'
import type { IModulesDetail, LessonDeliveryType, LessonDetailItem } from '@/lib/types/course'
import type { LessonDetailAssignment } from '@/lib/types/lesson'

/** Sama dengan tema app (Settings → Tema). */
export type LessonThemeMode = AppTheme

/** Lebar sidebar modul di desktop/tablet (px). */
export const LESSON_SIDEBAR_WIDTH_PX = 348

/** Breakpoint Tailwind tempat sidebar persisten + push layout aktif. */
export const LESSON_SIDEBAR_LAYOUT_BREAKPOINT = 'lg' as const

export type LessonEntry = {
  lesson: LessonDetailItem
  module: IModulesDetail
  moduleIndex: number
  lessonIndex: number
}

export const LESSON_ICON_MAP: Record<LessonDeliveryType, typeof FileText> = {
  video: Film,
  text: FileText,
}

export function getLessonIcon(contentType?: string) {
  if (contentType === 'video') return Film
  return FileText
}

export function getEmbedUrl(url: string): string | null {
  if (!url) return null

  try {
    const u = new URL(url)
    if (u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')) {
      const videoId = u.hostname.includes('youtu.be') ? u.pathname.slice(1) : u.searchParams.get('v')
      if (videoId) return `https://www.youtube.com/embed/${videoId}`
    }

    if (u.hostname.includes('vimeo.com')) {
      const match = u.pathname.match(/\/(\d+)/)
      if (match) return `https://player.vimeo.com/video/${match[1]}`
    }
  } catch {
    return null
  }

  return null
}

function moduleLessons(mod: IModulesDetail) {
  return mod.lessons ?? []
}

export function flattenLessons(modules: IModulesDetail[]): LessonEntry[] {
  return modules.flatMap((mod, moduleIndex) =>
    moduleLessons(mod).map((lesson, lessonIndex) => ({
      lesson,
      module: mod,
      moduleIndex,
      lessonIndex,
    })),
  )
}

export function moduleProgress(
  mod: IModulesDetail,
  readLessonIds: ReadonlySet<string>,
  assignmentByLessonUid?: ReadonlyMap<string, LessonDetailAssignment>,
  submittedAssignmentIds?: ReadonlySet<string>,
) {
  const lessons = moduleLessons(mod)
  let totalCount = lessons.length
  let completedCount = lessons.filter((lesson) => readLessonIds.has(lesson.uid)).length

  if (assignmentByLessonUid) {
    for (const lesson of lessons) {
      const assignment = assignmentByLessonUid.get(lesson.uid)
      if (assignment) {
        totalCount += 1
        if (
          submittedAssignmentIds?.has(assignment.uid) ||
          submittedAssignmentIds?.has(lesson.uid)
        ) {
          completedCount += 1
        }
      }
    }
  }

  return {
    completedCount,
    totalCount,
  }
}

export function isModuleComplete(
  mod: IModulesDetail,
  readLessonIds: ReadonlySet<string>,
  assignmentByLessonUid?: ReadonlyMap<string, LessonDetailAssignment>,
  submittedAssignmentIds?: ReadonlySet<string>,
) {
  const { completedCount, totalCount } = moduleProgress(
    mod,
    readLessonIds,
    assignmentByLessonUid,
    submittedAssignmentIds,
  )
  return totalCount > 0 && completedCount === totalCount
}
