import type { StaffAssignmentRole } from '@/lib/course-detail/course-assignment-navigation'
import type {
  AssignmentRosterStatusFilter,
  ICourseAssignmentRosterRow,
} from '@/lib/types/features/course-detail-assignments'
import type { ILessonDetailAssignment } from '@/lib/types/lesson'

export type CourseAssignmentRosterPageViewModel = {
  role: StaffAssignmentRole
  courseUid: string
  courseTitle: string
  lessonUid: string
  lessonTitle: string
  moduleTitle: string
  assignment: ILessonDetailAssignment | null
  rosterRows: ICourseAssignmentRosterRow[]
  rosterRowsForStatus: ICourseAssignmentRosterRow[]
  filteredRosterRows: ICourseAssignmentRosterRow[]
  isLoading: boolean
  isError: boolean
  errorMessage: string | null
  searchQuery: string
  onSearchQueryChange: (query: string) => void
  statusFilter: AssignmentRosterStatusFilter
  onStatusFilterChange: (filter: AssignmentRosterStatusFilter) => void
  backHref: string
  buildSubmissionDetailHref: (submissionUid: string) => string
}
