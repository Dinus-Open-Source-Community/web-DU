import {
  createFallbackLesson,
  getLessonKey,
  toLesson,
} from '@/lib/course-edit/mappers'
import type { EditableLesson, EditableModule, LessonApiItem } from '@/lib/course-edit/types'

export function mergeModuleLessonsFromApi(
  modules: EditableModule[],
  moduleUid: string,
  apiLessons: LessonApiItem[],
): EditableModule[] {
  return modules.map((module) => {
    if (module.uid !== moduleUid) return module

    const existingByKey = new Map(
      module.lessons.map((lesson) => [getLessonKey(lesson), lesson]),
    )

    if (apiLessons.length === 0) {
      if (module.lessons.length > 0) return module
      return { ...module, lessons: [createFallbackLesson(1)] }
    }

    const lessons = apiLessons.map((item, index) => {
      const existing = existingByKey.get(item.uid)
      if (existing) return existing
      return toLesson(item, index + 1)
    })

    const apiKeys = new Set(apiLessons.map((item) => item.uid))
    const localOnlyLessons = module.lessons.filter(
      (lesson) => !apiKeys.has(getLessonKey(lesson)),
    )

    return {
      ...module,
      lessons: [...lessons, ...localOnlyLessons],
    }
  })
}

export function findModuleForLesson(
  modules: EditableModule[],
  lessonId: string,
): EditableModule | null {
  for (const module of modules) {
    if (module.lessons.some((lesson) => getLessonKey(lesson) === lessonId)) {
      return module
    }
  }
  return null
}

export function remapLessonIdInModules(
  modules: EditableModule[],
  previousLessonId: string,
  nextLessonId: string,
): EditableModule[] {
  return modules.map((module) => ({
    ...module,
    lessons: module.lessons.map((lesson) => {
      if (getLessonKey(lesson) !== previousLessonId) return lesson
      return { ...lesson, id: nextLessonId, uid: nextLessonId }
    }),
  }))
}

export function toModuleShell(
  item: {
    uid: string
    course_uid?: string
    title: string
    order_index?: number
    created_at?: string
    updated_at?: string
  },
  fallbackOrder: number,
): EditableModule {
  return {
    uid: item.uid,
    course_uid: item.course_uid ?? '',
    title: item.title,
    order_index: Number(item.order_index ?? fallbackOrder) || fallbackOrder,
    created_at: item.created_at ?? '',
    updated_at: item.updated_at,
    lessons: [],
  }
}

export function getFirstEditableLessonId(module: EditableModule): string | null {
  const first = module.lessons[0]
  return first ? getLessonKey(first) : null
}

export function lessonBelongsToModule(
  modules: EditableModule[],
  lessonId: string,
  moduleUid: string,
): boolean {
  const module = modules.find((item) => item.uid === moduleUid)
  if (!module) return false
  return module.lessons.some((lesson) => getLessonKey(lesson) === lessonId)
}

export function collectPersistedLessonKeys(lessons: EditableLesson[]): string[] {
  return lessons.map((lesson) => getLessonKey(lesson))
}
