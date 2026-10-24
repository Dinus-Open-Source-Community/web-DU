import type { StudentAssignmentListStats } from './assignment-list-filters'
import type { StudentAssignmentRow } from './assignment-row-model'
import type { StudentAssignmentFeedCategory } from '@/lib/types/student-assignments'

export type StudentAssignmentListViewModel = {
  now: Date
  courseUidFilter: string | null
  clearCourseFilterHref: string
  category: StudentAssignmentFeedCategory
  onCategoryChange: (category: StudentAssignmentFeedCategory) => void
  searchInput: string
  onSearchInputChange: (value: string) => void
  onSearchSubmit: () => void
  stats: StudentAssignmentListStats
  paginatedRows: StudentAssignmentRow[]
  scopedCount: number
  categoryMatchCount: number
  hasVisibleRows: boolean
  currentPage: number
  totalPages: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}
