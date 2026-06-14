import type { IModulesDetail } from '@/lib/types/course'

import { collectReadLessonIdsFromModules } from './collect-read-lessons'

export function findLessonModuleUid(modules: IModulesDetail[], lessonUid: string) {
  for (const module of modules) {
    if ((module.lessons ?? []).some((lesson) => lesson.uid === lessonUid)) {
      return module.uid
    }
  }

  return undefined
}

export function isLessonMarkedAsRead(
  modules: IModulesDetail[],
  lessonUid: string,
  markedLessonIds: ReadonlySet<string>,
) {
  if (markedLessonIds.has(lessonUid)) return true

  for (const module of modules) {
    const lesson = (module.lessons ?? []).find((item) => item.uid === lessonUid)
    if (lesson?.is_reading) return true
  }

  return false
}

export function mergeReadLessonIds(
  modules: IModulesDetail[],
  markedLessonIds: ReadonlySet<string>,
) {
  const merged = new Set(collectReadLessonIdsFromModules(modules))
  markedLessonIds.forEach((lessonUid) => merged.add(lessonUid))
  return merged
}
