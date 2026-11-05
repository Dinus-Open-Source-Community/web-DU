import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  computeStudentAssignmentListStats,
  filterStudentAssignmentRowsByCategory,
  filterStudentAssignmentRowsBySearch,
  paginateStudentAssignmentRows,
  scopeStudentAssignmentRowsByCourse,
} from '@/lib/student-assignments/assignment-list-filters'
import type { StudentAssignmentListViewModel } from '@/lib/student-assignments/assignment-list-view-model'
import { toStudentAssignmentRows } from '@/lib/student-assignments/assignment-row-model'
import { mapStudentMyAssignmentsForView } from '@/lib/student-assignments/map-student-my-assignments'
import { ROUTES } from '@/lib/routes'
import type { StudentAssignmentFeedCategory, StudentAssignmentSectionItem } from '@/lib/types/student-assignments'
import type { IUserData } from '@/lib/types/user'
import type { IQueryParamsPayload } from '@/services/api-path'
import { useStudentMyAssignments } from '@/hooks/student-assignments/use-student-my-assignments'

export type { StudentAssignmentListViewModel } from '@/lib/student-assignments/assignment-list-view-model'

const DEFAULT_ITEMS_PER_PAGE = 10

type UseStudentAssignmentListViewOptions = {
  items?: StudentAssignmentSectionItem[]
  profile?: IUserData | null
  courseUidFilter?: string | null
  now?: Date
  itemsPerPage?: number
  clearCourseFilterHref?: string
}

export function useStudentAssignmentListView({
  items: itemsProp,
  profile,
  courseUidFilter = null,
  now: nowProp,
  itemsPerPage = DEFAULT_ITEMS_PER_PAGE,
  clearCourseFilterHref = ROUTES.student.assignments,
}: UseStudentAssignmentListViewOptions): StudentAssignmentListViewModel {
  const now = useMemo(() => nowProp ?? new Date(), [nowProp])
  const [category, setCategory] = useState<StudentAssignmentFeedCategory>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(itemsPerPage)

  useEffect(() => {
    setCurrentPage(1)
  }, [courseUidFilter])

  const useServerPagination = Boolean(profile?.uid)

  const queryParams = useMemo<IQueryParamsPayload>(() => {
    const params: IQueryParamsPayload = {
      page: currentPage,
      per_page: pageSize,
    }
    if (courseUidFilter) {
      params.course_uid = courseUidFilter
    }
    if (category !== 'all') {
      params.category = category
    }
    if (searchQuery.trim()) {
      params.search = searchQuery.trim()
    }
    return params
  }, [currentPage, pageSize, courseUidFilter, category, searchQuery])

  const { data: serverData, isLoading: isServerLoading, isFetching } = useStudentMyAssignments(
    queryParams,
    {
      fetchAll: false,
      enabled: useServerPagination,
    },
  )

  const items = useMemo(() => {
    if (useServerPagination && serverData) {
      return mapStudentMyAssignmentsForView(serverData, profile)
    }
    return itemsProp ?? []
  }, [useServerPagination, serverData, profile, itemsProp])

  const rows = useMemo(() => toStudentAssignmentRows(items, now), [items, now])

  // Fallback client-side processing if not using server pagination
  const scopedRows = useMemo(
    () => scopeStudentAssignmentRowsByCourse(rows, courseUidFilter),
    [rows, courseUidFilter],
  )
  const filteredRows = useMemo(
    () => filterStudentAssignmentRowsByCategory(scopedRows, category),
    [scopedRows, category],
  )
  const clientStats = useMemo(() => computeStudentAssignmentListStats(scopedRows), [scopedRows])
  const searchFilteredRows = useMemo(
    () => filterStudentAssignmentRowsBySearch(filteredRows, searchQuery),
    [filteredRows, searchQuery],
  )
  const { paginated: clientPaginated, totalPages: clientTotalPages, safePage: clientSafePage } = useMemo(
    () => paginateStudentAssignmentRows(searchFilteredRows, currentPage, pageSize),
    [searchFilteredRows, currentPage, pageSize],
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

  const onPageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize)
    setCurrentPage(1)
  }, [])

  if (useServerPagination && serverData?.meta) {
    const meta = serverData.meta
    const total = meta.total
    const totalPages = Math.max(1, meta.total_pages)
    const hasVisibleRows = rows.length > 0
    const hasSearch = Boolean(searchQuery.trim())

    const scopedCount = total === 0 ? (hasSearch || category !== 'all' ? 1 : 0) : total
    const categoryMatchCount = total === 0 ? (hasSearch ? 1 : 0) : total

    return {
      now,
      courseUidFilter,
      clearCourseFilterHref,
      category,
      onCategoryChange,
      searchInput,
      onSearchInputChange,
      onSearchSubmit,
      stats: computeStudentAssignmentListStats(rows),
      paginatedRows: rows,
      scopedCount,
      categoryMatchCount,
      hasVisibleRows,
      currentPage: meta.current_page,
      totalPages,
      total,
      pageSize: meta.per_page,
      onPageChange,
      onPageSizeChange,
      isLoading: isServerLoading && !serverData,
      isFetching,
    }
  }

  return {
    now,
    courseUidFilter,
    clearCourseFilterHref,
    category,
    onCategoryChange,
    searchInput,
    onSearchInputChange,
    onSearchSubmit,
    stats: clientStats,
    paginatedRows: clientPaginated,
    scopedCount: scopedRows.length,
    categoryMatchCount: filteredRows.length,
    hasVisibleRows: searchFilteredRows.length > 0,
    currentPage: clientSafePage,
    totalPages: clientTotalPages,
    total: searchFilteredRows.length,
    pageSize,
    onPageChange,
    onPageSizeChange,
    isLoading: false,
    isFetching: false,
  }
}
