import { useQuery } from '@tanstack/react-query'

import { courseKeys } from '@/hooks/query-keys'
import { fetchCourseAssignments } from '@/services/course-assignments'

const OVERVIEW_ASSIGNMENTS_PARAMS = { per_page: 100 } as const

export function useCourseDetailOverviewAssignments(courseUid: string, enabled: boolean) {
  const query = useQuery({
    queryKey: courseKeys.assignments(courseUid, OVERVIEW_ASSIGNMENTS_PARAMS),
    queryFn: () => fetchCourseAssignments(courseUid, OVERVIEW_ASSIGNMENTS_PARAMS),
    enabled: enabled && Boolean(courseUid),
    staleTime: 60_000,
    retry: false,
  })

  return {
    assignments: query.data?.assignments ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  }
}
