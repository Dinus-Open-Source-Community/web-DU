import { useMemo } from 'react'

import { useStudentMyAssignments } from '@/hooks/student-assignments/use-student-my-assignments'
import { mapStudentMyAssignmentsForView } from '@/lib/student-assignments/map-student-my-assignments'
import { mapJoinedCourseAssignments } from '@/lib/student-assignments/map-joined-course-assignments'
import type { IPaginationMeta } from '@/lib/types/common/pagination'
import type { StudentAssignmentSectionItem } from '@/lib/types/student-assignments'
import type { IUserData } from '@/lib/types/user'
import type { IQueryParamsPayload } from '@/services/api-path'

type UseStudentAssignmentItemsResult = {
  items: StudentAssignmentSectionItem[]
  meta?: IPaginationMeta
  isLoading: boolean
  isFetching: boolean
  isError: boolean
}

type UseStudentAssignmentItemsOptions = {
  fetchAll?: boolean
  params?: IQueryParamsPayload
}

export function useStudentAssignmentItems(
  profile: IUserData | null | undefined,
  options: UseStudentAssignmentItemsOptions = {},
): UseStudentAssignmentItemsResult {
  const { data, isLoading, isFetching, isError } = useStudentMyAssignments(
    options.params,
    {
      fetchAll: options.fetchAll ?? false,
      enabled: Boolean(profile?.uid),
    },
  )

  const items = useMemo(() => {
    if (data?.assignments) {
      return mapStudentMyAssignmentsForView(data, profile)
    }
    return mapJoinedCourseAssignments(profile)
  }, [data, profile])

  return {
    items,
    meta: data?.meta,
    isLoading: isLoading && items.length === 0,
    isFetching,
    isError,
  }
}
