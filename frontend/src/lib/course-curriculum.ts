import type { IModulesData } from '@/lib/types/module'
import type { CourseDetailLesson, LessonDeliveryType } from '@/lib/types/lesson'

function createLocalId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`
  }
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

export function getModuleLessons(module: IModulesData): CourseDetailLesson[] {
  return module.lessons ?? []
}

export function createDefaultLesson(order_index = 1): CourseDetailLesson {
  const now = new Date().toISOString()
  return {
    uid: createLocalId('les'),
    title: `Lesson ${order_index}`,
    order_index,
    module_uid: '',
    created_at: now,
    updated_at: now,
    content_type: 'text',
    content: null,
    video_url: '',
    start_time: now,
    end_time: now,
  }
}

export function createDefaultModule(order_index = 1, title?: string): IModulesData {
  return {
    uid: createLocalId('mod'),
    title: title?.trim() || `Modul ${order_index}`,
    order_index,
    course_uid: '',
    created_at: new Date().toISOString(),
    lessons: [createDefaultLesson(1)],
  }
}

export function addModule(modules: IModulesData[], title: string): IModulesData[] {
  const nextOrder = modules.length + 1
  return [...modules, createDefaultModule(nextOrder, title)]
}

export function removeModule(modules: IModulesData[], moduleId: string): IModulesData[] {
  const next = modules
    .filter((module) => module.uid !== moduleId)
    .map((module, index) => ({ ...module, order_index: index + 1 }))

  return next.length > 0 ? next : [createDefaultModule(1)]
}

export function renameModule(
  modules: IModulesData[],
  moduleId: string,
  title: string,
): IModulesData[] {
  const trimmed = title.trim()
  return modules.map((module) =>
    module.uid === moduleId
      ? { ...module, title: trimmed || module.title }
      : module,
  )
}

export function addLesson(modules: IModulesData[], moduleId: string): IModulesData[] {
  return modules.map((module) => {
    if (module.uid !== moduleId) return module

    const lessons = getModuleLessons(module)
    const nextOrder = lessons.length + 1
    const newLesson = createDefaultLesson(nextOrder)

    return { ...module, lessons: [...lessons, newLesson] }
  })
}

export function removeLesson(
  modules: IModulesData[],
  moduleId: string,
  lessonId: string,
): IModulesData[] {
  return modules.map((module) => {
    if (module.uid !== moduleId) return module

    const filtered = getModuleLessons(module)
      .filter((lesson) => lesson.uid !== lessonId)
      .map((lesson, index) => ({ ...lesson, order_index: index + 1 }))

    return {
      ...module,
      lessons: filtered.length > 0 ? filtered : [createDefaultLesson(1)],
    }
  })
}

export function renameLesson(
  modules: IModulesData[],
  moduleId: string,
  lessonId: string,
  title: string,
): IModulesData[] {
  const trimmed = title.trim()

  return modules.map((module) => {
    if (module.uid !== moduleId) return module

    return {
      ...module,
      lessons: getModuleLessons(module).map((lesson) =>
        lesson.uid === lessonId
          ? { ...lesson, title: trimmed || lesson.title }
          : lesson,
      ),
    }
  })
}

export function changeLessonDeliveryType(
  modules: IModulesData[],
  moduleId: string,
  lessonId: string,
  deliveryType: LessonDeliveryType,
): IModulesData[] {
  return modules.map((module) => {
    if (module.uid !== moduleId) return module

    return {
      ...module,
      lessons: getModuleLessons(module).map((lesson) => {
        if (lesson.uid !== lessonId) return lesson

        const content_type: CourseDetailLesson['content_type'] =
          deliveryType === 'video' ? 'video' : 'text'

        return {
          ...lesson,
          content_type,
          content: null,
          video_url: '',
        }
      }),
    }
  })
}

export function findModuleByLessonId(
  modules: IModulesData[],
  lessonId: string,
): IModulesData | undefined {
  return modules.find((module) =>
    getModuleLessons(module).some((lesson) => lesson.uid === lessonId),
  )
}

export function getFirstLessonId(module: IModulesData): string | null {
  return getModuleLessons(module)[0]?.uid ?? null
}
