import { useMemo, useCallback, useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { useAssignMentorsToCourse } from '@/hooks/use-course-mutations'
import { userManageKeys } from '@/hooks/query-keys'
import type { AssignCourseMentorDialogViewModel } from '@/lib/course-detail/assign-course-mentor-view-model'
import { mapManagedUsers, toAdminMentor } from '@/lib/user-manage/mappers'
import { mentorToRow, rowsToPromoteCandidates } from '@/lib/user-manage/view-models'
import { fetchManagedUsers } from '@/services/user-manage'

type UseAssignCourseMentorDialogOptions = {
  courseUid: string
  assignedMentorUids: string[]
  enabled?: boolean
}

export type { AssignCourseMentorDialogViewModel } from '@/lib/course-detail/assign-course-mentor-view-model'

export function useAssignCourseMentorDialog({
  courseUid,
  assignedMentorUids,
  enabled = true,
}: UseAssignCourseMentorDialogOptions): AssignCourseMentorDialogViewModel {
  const [open, setOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [loadedItems, setLoadedItems] = useState<ReturnType<typeof rowsToPromoteCandidates>>([])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setSearch(searchInput.trim()), 300)
    return () => window.clearTimeout(timeoutId)
  }, [searchInput])

  useEffect(() => {
    setPage(1)
    setLoadedItems([])
  }, [search])

  const mentorsQuery = useQuery({
    queryKey: userManageKeys.list({
      role: 'mentor',
      page,
      per_page: 20,
      search: search || undefined,
      sort: 'created_at',
      order: 'desc',
    }),
    queryFn: () =>
      fetchManagedUsers({
        role: 'mentor',
        page,
        per_page: 20,
        search: search || undefined,
        sort: 'created_at',
        order: 'desc',
      }),
    enabled: enabled && open,
  })
  const assignMentors = useAssignMentorsToCourse()

  const assignedUidSet = useMemo(() => new Set(assignedMentorUids), [assignedMentorUids])

  const loadedPageItems = useMemo(() => {
    const mentors = mapManagedUsers(mentorsQuery.data?.users ?? [], toAdminMentor)
    const rows = mentors
      .filter((mentor) => !assignedUidSet.has(mentor.uid))
      .map(mentorToRow)
    return rowsToPromoteCandidates(rows, 'Mentor')
  }, [assignedUidSet, mentorsQuery.data?.users])

  useEffect(() => {
    if (!open || !mentorsQuery.data) return
    setLoadedItems((current) => {
      if (page === 1) return loadedPageItems
      const existing = new Set(current.map((item) => item.uid))
      return [...current, ...loadedPageItems.filter((item) => !existing.has(item.uid))]
    })
  }, [loadedPageItems, mentorsQuery.data, open, page])

  const onConfirm = useCallback(
    async (uids: string[]) => {
      await assignMentors.mutateAsync({
        courseUid,
        payload: { mentor_uids: uids },
      })
    },
    [assignMentors, courseUid],
  )

  const isMentorsLoading = mentorsQuery.isFetching && !mentorsQuery.data

  return {
    candidates: loadedItems,
    isLoading: isMentorsLoading,
    emptyTitle: isMentorsLoading ? 'Memuat mentor...' : 'Semua mentor sudah ditugaskan',
    emptyDescription: isMentorsLoading
      ? 'Mohon tunggu sebentar.'
      : 'Tidak ada mentor lain yang tersedia untuk kursus ini.',
    onConfirm,
    onOpenChange: setOpen,
    onSearchChange: setSearchInput,
    hasMore: page < (mentorsQuery.data?.meta.total_pages ?? 1),
    isLoadingMore: mentorsQuery.isFetching && Boolean(mentorsQuery.data),
    onLoadMore: () => setPage((current) => current + 1),
    candidateCount: mentorsQuery.data?.meta.total,
    candidatesLoading: isMentorsLoading,
  }
}
