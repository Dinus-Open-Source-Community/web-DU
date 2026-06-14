import type { IModulesDetail } from '@/lib/types/course'

export function collectReadLessonIdsFromModules(modules: IModulesDetail[]): ReadonlySet<string> {
  const readLessonIds = new Set<string>()

  for (const module of modules) {
    for (const lesson of module.lessons ?? []) {
      if (lesson.is_reading) {
        readLessonIds.add(lesson.uid)
      }
    }
  }

  return readLessonIds
}
