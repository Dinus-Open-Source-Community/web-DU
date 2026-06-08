import { useMemo } from 'react'

import { mapJoinedCourseAssignments } from '@/lib/student-assignments/map-joined-course-assignments'
import type { StudentAssignmentSectionItem } from '@/lib/types/student-assignments'
import type { IUserData } from '@/lib/types/user'

export function useStudentAssignmentItems(
  profile: IUserData | null | undefined,
): StudentAssignmentSectionItem[] {
  return useMemo(() => mapJoinedCourseAssignments(profile), [profile])
}
