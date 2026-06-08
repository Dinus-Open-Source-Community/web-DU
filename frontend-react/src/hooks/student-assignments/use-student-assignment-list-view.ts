import { useCallback, useMemo, useState } from 'react'

import {
  computeStudentAssignmentListStats,
  filterStudentAssignmentRowsByCategory,
  filterStudentAssignmentRowsBySearch,
  paginateStudentAssignmentRows,
  scopeStudentAssignmentRowsByCourse,
} from '@/lib/student-assignments/assignment-list-filters'
import type { StudentAssignmentListViewModel } from '@/lib/student-assignments/assignment-list-view-model'
import { toStudentAssignmentRows } from '@/lib/student-assignments/assignment-row-model'
import type { StudentAssignmentFeedCategory, StudentAssignmentSectionItem } from '@/lib/types/student-assignments'

export type { StudentAssignmentListViewModel } from '@/lib/student-assignments/assignment-list-view-model'

const DEFAULT_ITEMS_PER_PAGE = 6

type UseStudentAssignmentListViewOptions = {
  items: StudentAssignmentSectionItem[]
  courseUidFilter?: string | null
  now?: Date
  itemsPerPage?: number
  clearCourseFilterHref?: string
}

export function useStudentAssignmentListView({
  items,
  courseUidFilter = null,
  now: nowProp,
  itemsPerPage = DEFAULT_ITEMS_PER_PAGE,
  clearCourseFilterHref = '/student/assignments',
}: UseStudentAssignmentListViewOptions): StudentAssignmentListViewModel {
  const now = useMemo(() => nowProp ?? new Date(), [nowProp])
  const [category, setCategory] = useState<StudentAssignmentFeedCategory>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const rows = useMemo(() => toStudentAssignmentRows(items, now), [items, now])
  const scopedRows = useMemo(
    () => scopeStudentAssignmentRowsByCourse(rows, courseUidFilter),
    [rows, courseUidFilter],
  )
  const filteredRows = useMemo(
    () => filterStudentAssignmentRowsByCategory(scopedRows, category),
    [scopedRows, category],
  )
  const stats = useMemo(() => computeStudentAssignmentListStats(scopedRows), [scopedRows])
  const searchFilteredRows = useMemo(
    () => filterStudentAssignmentRowsBySearch(filteredRows, searchQuery),
    [filteredRows, searchQuery],
  )
  const { paginated, totalPages, safePage } = useMemo(
    () => paginateStudentAssignmentRows(searchFilteredRows, currentPage, itemsPerPage),
    [searchFilteredRows, currentPage, itemsPerPage],
  )

  const onCategoryChange = useCallback((nextCategory: StudentAssignmentFeedCategory) => {
    setCategory(nextCategory)
    setCurrentPage(1)
  }, [])

  const onSearchSubmit = useCallback(() => {
    setSearchQuery(searchInput)
    setCurrentPage(1)
  }, [searchInput])

  const onSearchInputChange = useCallback((value: string) => {
    setSearchInput(value)
  }, [])

  const onPageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  return {
    now,
    courseUidFilter,
    clearCourseFilterHref,
    category,
    onCategoryChange,
    searchInput,
    onSearchInputChange,
    onSearchSubmit,
    stats,
    paginatedRows: paginated,
    scopedCount: scopedRows.length,
    hasVisibleRows: searchFilteredRows.length > 0,
    currentPage: safePage,
    totalPages,
    onPageChange,
  }
}
