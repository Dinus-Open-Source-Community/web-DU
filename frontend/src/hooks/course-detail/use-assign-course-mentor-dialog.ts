import { useMemo, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'

import { useAssignMentorsToCourse } from '@/hooks/use-course-mutations'
import { userManageKeys } from '@/hooks/query-keys'
import type { AssignCourseMentorDialogViewModel } from '@/lib/course-detail/assign-course-mentor-view-model'
import { mapManagedUsers, toAdminMentor } from '@/lib/user-manage/mappers'
import type { PersonSelectionItem } from '@/lib/types/utils'
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
  const mentorsQuery = useQuery({
    queryKey: userManageKeys.list({
      role: 'mentor',
      per_page: 100,
      sort: 'created_at',
      order: 'desc',
    }),
    queryFn: () =>
      fetchManagedUsers({
        role: 'mentor',
        per_page: 100,
        sort: 'created_at',
        order: 'desc',
      }),
    enabled,
  })
  const assignMentors = useAssignMentorsToCourse()

  const assignedUidSet = useMemo(() => new Set(assignedMentorUids), [assignedMentorUids])

  const items: PersonSelectionItem[] = useMemo(() => {
    const mentors = mapManagedUsers(mentorsQuery.data?.users ?? [], toAdminMentor)
    return mentors
      .filter((mentor) => !assignedUidSet.has(mentor.uid))
      .map((mentor) => ({
        uid: mentor.uid,
        name: mentor.name,
        email: mentor.email,
        avatar: mentor.avatar,
        detail: `Bergabung ${mentor.joinedAt}`,
      }))
  }, [assignedUidSet, mentorsQuery.data?.users])

  const onConfirm = useCallback(
    async (item: PersonSelectionItem) => {
      await assignMentors.mutateAsync({
        courseUid,
        payload: { mentor_uids: [item.uid] },
      })
    },
    [assignMentors, courseUid],
  )

  return {
    items,
    isLoading: mentorsQuery.isLoading,
    emptyTitle: mentorsQuery.isLoading ? 'Memuat mentor...' : 'Semua mentor sudah ditugaskan',
    emptyDescription: mentorsQuery.isLoading
      ? 'Mohon tunggu sebentar.'
      : 'Tidak ada mentor lain yang tersedia untuk kursus ini.',
    onConfirm,
  }
}
