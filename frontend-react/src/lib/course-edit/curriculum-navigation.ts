import { getModuleLessons } from '@/lib/course-curriculum'
import type { EditableLesson } from '@/lib/course-edit/types'
import type { IModulesData } from '@/lib/types/module'

export function resolveActiveModule(
  modules: IModulesData[],
  activeModuleId: string | null,
): IModulesData | null {
  if (modules.length === 0) return null
  return modules.find((module) => module.uid === activeModuleId) ?? modules[0]
}

export function findLessonIndex(
  module: IModulesData | null,
  activeLessonId: string | null,
): number {
  if (!module || !activeLessonId) return -1
  return getModuleLessons(module).findIndex((lesson) => lesson.uid === activeLessonId)
}

export function getAdjacentLessonIds(
  module: IModulesData | null,
  activeLessonId: string | null,
): { previousLessonId: string | null; nextLessonId: string | null } {
  const lessons = module ? getModuleLessons(module) : []
  const activeIndex = findLessonIndex(module, activeLessonId)

  if (activeIndex < 0) {
    return { previousLessonId: null, nextLessonId: null }
  }

  return {
    previousLessonId: activeIndex > 0 ? lessons[activeIndex - 1].uid : null,
    nextLessonId:
      activeIndex < lessons.length - 1 ? lessons[activeIndex + 1].uid : null,
  }
}
