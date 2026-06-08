import { useMemo } from 'react'

import { useCourseCategories, useCourseTypes } from '@/hooks/use-course'
import type { CourseFormOptionsViewModel } from '@/lib/course-form/course-form-options-view-model'

export type { CourseFormOptionsViewModel } from '@/lib/course-form/course-form-options-view-model'

export function useCourseFormOptions(): CourseFormOptionsViewModel {
  const { data: categoryResponse, isLoading: categoriesLoading } = useCourseCategories({ per_page: 100 })
  const { data: courseTypeResponse, isLoading: typesLoading } = useCourseTypes({ per_page: 100 })

  const categories = useMemo(() => categoryResponse?.course_categories ?? [], [categoryResponse])
  const courseTypes = useMemo(() => courseTypeResponse?.course_types ?? [], [courseTypeResponse])

  return {
    categories,
    courseTypes,
    optionsLoading: categoriesLoading || typesLoading,
  }
}
