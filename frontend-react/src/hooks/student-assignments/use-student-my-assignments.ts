import { useQuery } from '@tanstack/react-query'

import { studentAssignmentKeys } from '@/hooks/query-keys'
import type { IQueryParamsPayload } from '@/services/api-path'
import { fetchStudentMyAssignments } from '@/services/student-assignments'

export function useStudentMyAssignments(params?: IQueryParamsPayload) {
  return useQuery({
    queryKey: studentAssignmentKeys.myList(params),
    queryFn: () => fetchStudentMyAssignments(params),
    staleTime: 30_000,
  })
}
