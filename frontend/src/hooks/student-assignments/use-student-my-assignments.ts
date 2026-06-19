import { useQuery } from '@tanstack/react-query'

import { studentAssignmentKeys } from '@/hooks/query-keys'
import type { IQueryParamsPayload } from '@/services/api-path'
import {
  fetchAllStudentMyAssignments,
  fetchStudentMyAssignments,
} from '@/services/student-assignments'

type UseStudentMyAssignmentsOptions = {
  fetchAll?: boolean
}

export function useStudentMyAssignments(
  params?: IQueryParamsPayload,
  options: UseStudentMyAssignmentsOptions = {},
) {
  const { fetchAll = false } = options

  return useQuery({
    queryKey: fetchAll
      ? [...studentAssignmentKeys.myList(params), 'all']
      : studentAssignmentKeys.myList(params),
    queryFn: () =>
      fetchAll ? fetchAllStudentMyAssignments() : fetchStudentMyAssignments(params),
    staleTime: 30_000,
  })
}
