import type { CourseAssignmentOverviewItem } from '@/lib/course-detail/course-assignment-overview-presenter'
import type { CourseAssignmentTaskFilter } from '@/lib/types/features/course-detail-assignments'

export type CourseDetailAssignmentsViewModel = {
  isLoading: boolean
  isError: boolean
  errorMessage: string | null
  taskFilter: CourseAssignmentTaskFilter
  onTaskFilterChange: (filter: CourseAssignmentTaskFilter) => void
  searchQuery: string
  onSearchQueryChange: (query: string) => void
  assignmentItems: CourseAssignmentOverviewItem[]
}
