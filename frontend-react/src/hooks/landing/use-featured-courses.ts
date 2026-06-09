import { useMemo } from 'react'

import { pickTopRatedCourses } from '@/lib/landing/featured-courses'
import { useCourses } from '@/hooks/use-course'

export function useFeaturedCourses() {
  const query = useCourses({
    per_page: 100,
    status: 'ACTIVE',
    sort_by: 'created_at',
    sort_order: 'desc',
  })

  const courses = useMemo(
    () => pickTopRatedCourses(query.data?.courses ?? []),
    [query.data?.courses],
  )

  return {
    courses,
    isLoading: query.isLoading,
    error: query.error,
  }
}
