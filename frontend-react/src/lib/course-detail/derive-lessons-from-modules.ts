import type { ICourseDetailLessonRef } from '@/lib/types/features/course-detail-assignments'
import type { IModulesData } from '@/lib/types/course'

export function deriveLessonsFromModules(modules: IModulesData[]): ICourseDetailLessonRef[] {
  const lessons = modules.flatMap((module) =>
    (module.lessons ?? []).map((lesson) => ({
      uid: lesson.uid,
      title: lesson.title,
      moduleUid: module.uid,
      moduleTitle: module.title,
      orderIndex: lesson.order_index,
    })),
  )

  return lessons.sort((left, right) => left.orderIndex - right.orderIndex)
}
