import { useMemo } from 'react'

import { deriveLessonsFromModules } from '@/lib/course-detail/derive-lessons-from-modules'
import type { ICourseDetailLessonRef } from '@/lib/types/features/course-detail-assignments'
import type { IModulesData } from '@/lib/types/course'

export function useCourseDetailLessons(modules: IModulesData[], enabled = true) {
  const lessons = useMemo(
    (): ICourseDetailLessonRef[] => (enabled ? deriveLessonsFromModules(modules) : []),
    [enabled, modules],
  )

  return {
    lessons,
    isLoading: false,
    isError: false,
    error: null,
  }
}
