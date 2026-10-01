import type { StaffAssignmentRole } from '@/lib/course-detail/course-assignment-navigation'
import type { CourseAssignmentOverviewItem } from '@/lib/course-detail/course-assignment-overview-presenter'
import type { CourseAssignmentTaskFilter } from '@/lib/types/features/course-detail-assignments'

export type CourseDetailAssignmentsViewModel = {
  role: StaffAssignmentRole
  isLoading: boolean
  isHydratingSubmissions: boolean
  isError: boolean
  errorMessage: string | null
  taskFilter: CourseAssignmentTaskFilter
  onTaskFilterChange: (filter: CourseAssignmentTaskFilter) => void
  searchQuery: string
  onSearchQueryChange: (query: string) => void
  assignmentItems: CourseAssignmentOverviewItem[]
  itemsForTaskType: CourseAssignmentOverviewItem[]
  prefetchSubmissionRoster: (lessonUid: string) => void
}
