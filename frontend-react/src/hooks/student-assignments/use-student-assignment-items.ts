import { useMemo } from 'react'

import { mapStudentMyAssignmentsResponse } from '@/lib/student-assignments/map-student-my-assignments'
import type { StudentAssignmentSectionItem } from '@/lib/types/student-assignments'
import type { IUserData } from '@/lib/types/user'

import { useStudentMyAssignments } from './use-student-my-assignments'

type UseStudentAssignmentItemsResult = {
  items: StudentAssignmentSectionItem[]
  isLoading: boolean
  isError: boolean
}

export function useStudentAssignmentItems(
  profile: IUserData | null | undefined,
): UseStudentAssignmentItemsResult {
  const query = useStudentMyAssignments({ per_page: 100 })

  const items = useMemo(() => {
    if (!profile || !query.data) return []

    return mapStudentMyAssignmentsResponse(query.data, {
      uid: profile.uid,
      name: profile.name,
      avatar_url: profile.avatar_url,
    })
  }, [profile, query.data])

  return {
    items,
    isLoading: query.isLoading,
    isError: query.isError,
  }
}
