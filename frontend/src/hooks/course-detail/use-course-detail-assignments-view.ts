import { useCallback, useDeferredValue, useMemo, useState } from 'react'

import { useQueryStateEnum } from '@/lib/nuqs-react-router'
import { useQueryClient } from '@tanstack/react-query'

import { useCourseAssignmentsOverview } from '@/hooks/course-detail/use-course-assignments-overview'
import { lessonAssignmentKeys } from '@/hooks/query-keys'
import { toMinimalLessonAssignment } from '@/lib/course-detail/map-course-assignment-bulk'
import { fetchLessonAssignmentSubmissions } from '@/services/lesson-assignment-submission'
import { toAssignmentOverviewItems } from '@/lib/course-detail/course-assignment-overview-presenter'
import type { StaffAssignmentRole } from '@/lib/course-detail/course-assignment-navigation'
import type { CourseDetailAssignmentsViewModel } from '@/lib/course-detail/course-detail-assignments-view-model'
import type { CourseAssignmentTaskFilter } from '@/lib/types/features/course-detail-assignments'
import type { IMentorCourseStudent } from '@/lib/types/course'

const ASSIGNMENT_TASK_FILTER_VALUES = ['quiz', 'text'] as const satisfies readonly CourseAssignmentTaskFilter[]

const DEFAULT_ASSIGNMENT_TASK_FILTER: CourseAssignmentTaskFilter = 'quiz'

type UseCourseDetailAssignmentsViewOptions = {
  courseUid: string
  role: StaffAssignmentRole
  students: IMentorCourseStudent[]
  enabled?: boolean
}

export function useCourseDetailAssignmentsView({
  courseUid,
  role,
  students,
  enabled = true,
}: UseCourseDetailAssignmentsViewOptions): CourseDetailAssignmentsViewModel {
  const queryClient = useQueryClient()
  const [taskFilter, setTaskFilter] = useQueryStateEnum(
    'task',
    ASSIGNMENT_TASK_FILTER_VALUES,
    DEFAULT_ASSIGNMENT_TASK_FILTER,
  )
  const activeTaskFilter: CourseAssignmentTaskFilter =
    taskFilter ?? DEFAULT_ASSIGNMENT_TASK_FILTER
  const [searchQuery, setSearchQuery] = useState('')
  const deferredSearchQuery = useDeferredValue(searchQuery)

  const {
    sources,
    isLoading,
    isHydratingSubmissions,
    isError,
    error,
  } = useCourseAssignmentsOverview(courseUid, enabled)

  const itemsForTaskType = useMemo(() => {
    const overviewItems = toAssignmentOverviewItems(sources, role, courseUid, students)
    return overviewItems.filter((item) => item.taskType === activeTaskFilter)
  }, [courseUid, role, sources, students, activeTaskFilter])

  const assignmentItems = useMemo(() => {
    const normalizedSearch = deferredSearchQuery.trim().toLowerCase()
    if (!normalizedSearch) return itemsForTaskType

    return itemsForTaskType.filter((item) => {
      const haystack = [item.assignmentTitle, item.lessonTitle, item.moduleTitle]
        .join(' ')
        .toLowerCase()

      return haystack.includes(normalizedSearch)
    })
  }, [deferredSearchQuery, itemsForTaskType])

  const prefetchSubmissionRoster = useCallback(
    (lessonUid: string) => {
      const source = sources.find((item) => item.lessonUid === lessonUid)
      if (!source || source.submissionCount === 0) return

      const assignment = {
        uid: source.assignmentUid,
        lessonUid: source.lessonUid,
        lessonTitle: source.lessonTitle,
        lessonOrderIndex: source.lessonOrderIndex,
        moduleTitle: source.moduleTitle,
        moduleOrderIndex: source.moduleOrderIndex,
        title: source.assignmentTitle,
        taskType: source.taskType,
        submissionCount: source.submissionCount,
      }

      void queryClient.prefetchQuery({
        queryKey: lessonAssignmentKeys.staffSubmissions(lessonUid),
        queryFn: () =>
          fetchLessonAssignmentSubmissions(lessonUid, {
            lessonTitle: assignment.lessonTitle,
            moduleTitle: assignment.moduleTitle,
            assignment: toMinimalLessonAssignment(assignment),
          }),
        staleTime: 30_000,
      })
    },
    [queryClient, sources],
  )

  return {
    role,
    isLoading,
    isHydratingSubmissions,
    isError,
    errorMessage: (error as Error | undefined)?.message ?? null,
    taskFilter: activeTaskFilter,
    onTaskFilterChange: setTaskFilter,
    searchQuery,
    onSearchQueryChange: setSearchQuery,
    assignmentItems,
    itemsForTaskType,
    prefetchSubmissionRoster,
  }
}
