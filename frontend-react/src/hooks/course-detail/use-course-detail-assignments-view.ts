import { useMemo, useState } from 'react'

import { toAssignmentOverviewItems } from '@/lib/course-detail/course-assignment-overview-presenter'
import type { StaffAssignmentRole } from '@/lib/course-detail/course-assignment-navigation'
import { useCourseDetailLessons } from '@/hooks/course-detail/use-course-detail-lessons'
import { useCourseStaffAssignmentsData } from '@/hooks/course-detail/use-course-staff-assignments-data'
import type { CourseDetailAssignmentsViewModel } from '@/lib/course-detail/course-detail-assignments-view-model'
import type { CourseAssignmentTaskFilter } from '@/lib/types/features/course-detail-assignments'
import type { IMentorCourseStudent, IModulesData } from '@/lib/types/course'

type UseCourseDetailAssignmentsViewOptions = {
  courseUid: string
  role: StaffAssignmentRole
  modules: IModulesData[]
  students: IMentorCourseStudent[]
  enabled?: boolean
}

export function useCourseDetailAssignmentsView({
  courseUid,
  role,
  modules,
  students,
  enabled = true,
}: UseCourseDetailAssignmentsViewOptions): CourseDetailAssignmentsViewModel {
  const [taskFilter, setTaskFilter] = useState<CourseAssignmentTaskFilter>('text')
  const [searchQuery, setSearchQuery] = useState('')

  const {
    lessons,
    isLoading: lessonsLoading,
    isError: lessonsError,
    error: lessonsErrorObj,
  } = useCourseDetailLessons(modules, enabled)

  const {
    bundles,
    isLoading: submissionsLoading,
    isError: submissionsError,
    error: submissionsErrorObj,
  } = useCourseStaffAssignmentsData(lessons, enabled)

  const assignmentItems = useMemo(() => {
    const overviewItems = toAssignmentOverviewItems(bundles, role, courseUid, students)
    const normalizedSearch = searchQuery.trim().toLowerCase()

    return overviewItems.filter((item) => {
      if (item.taskType !== taskFilter) return false
      if (!normalizedSearch) return true

      const haystack = [item.assignmentTitle, item.lessonTitle, item.moduleTitle]
        .join(' ')
        .toLowerCase()

      return haystack.includes(normalizedSearch)
    })
  }, [bundles, courseUid, role, searchQuery, students, taskFilter])

  return {
    isLoading: lessonsLoading || submissionsLoading,
    isError: lessonsError || submissionsError,
    errorMessage:
      (lessonsErrorObj as Error | undefined)?.message ??
      (submissionsErrorObj as Error | undefined)?.message ??
      null,
    taskFilter,
    onTaskFilterChange: setTaskFilter,
    searchQuery,
    onSearchQueryChange: setSearchQuery,
    assignmentItems,
  }
}
