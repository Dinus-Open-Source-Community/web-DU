import { useMemo } from 'react'

import { mapJoinedCourseAssignments } from '@/lib/student-assignments/map-joined-course-assignments'
import type { StudentAssignmentSectionItem } from '@/lib/types/student-assignments'
import type { IUserData } from '@/lib/types/user'

type UseStudentAssignmentItemsResult = {
  items: StudentAssignmentSectionItem[]
  isLoading: boolean
  isError: boolean
}

export function useStudentAssignmentItems(
  profile: IUserData | null | undefined,
): UseStudentAssignmentItemsResult {
  const items = useMemo(() => mapJoinedCourseAssignments(profile), [profile])

  return {
    items,
    isLoading: false,
    isError: false,
  }
}
