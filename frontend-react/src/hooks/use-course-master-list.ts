import { useQuery } from '@tanstack/react-query'

import type { CourseMasterKind } from '@/lib/course-master/types'
import type { IQueryParamsPayload } from '@/services/api-path'
import { fetchCourseCategories, fetchCourseTypes } from '@/services/course'
import { courseKeys } from './query-keys'

export function useCourseMasterList(
  kind: CourseMasterKind,
  params?: IQueryParamsPayload,
) {
  const categoriesQuery = useQuery({
    queryKey: courseKeys.categories(params),
    queryFn: () => fetchCourseCategories(params),
    enabled: kind === 'category',
  })

  const typesQuery = useQuery({
    queryKey: courseKeys.types(params),
    queryFn: () => fetchCourseTypes(params),
    enabled: kind === 'type',
  })

  if (kind === 'category') {
    return {
      items: categoriesQuery.data?.course_categories ?? [],
      meta: categoriesQuery.data?.meta,
      isLoading: categoriesQuery.isLoading,
      isError: categoriesQuery.isError,
      error: categoriesQuery.error,
    }
  }

  return {
    items: typesQuery.data?.course_types ?? [],
    meta: typesQuery.data?.meta,
    isLoading: typesQuery.isLoading,
    isError: typesQuery.isError,
    error: typesQuery.error,
  }
}
