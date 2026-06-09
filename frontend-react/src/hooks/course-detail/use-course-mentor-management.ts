import { useCallback, useState } from 'react'

import { useUnassignMentorsFromCourse } from '@/hooks/use-course-mutations'
import type { ICourseMentorItem } from '@/lib/types/user'

type UseCourseMentorManagementOptions = {
  courseUid: string
  enabled?: boolean
}

export type CourseMentorManagementViewModel = {
  pendingUnassignMentor: ICourseMentorItem | null
  onRequestUnassignMentor: (mentor: ICourseMentorItem) => void
  onCancelUnassignMentor: () => void
  onConfirmUnassignMentor: () => Promise<void>
  unassigningMentorUid: string | null
}

export function useCourseMentorManagement({
  courseUid,
  enabled = true,
}: UseCourseMentorManagementOptions): CourseMentorManagementViewModel {
  const unassignMentors = useUnassignMentorsFromCourse()
  const [pendingUnassignMentor, setPendingUnassignMentor] = useState<ICourseMentorItem | null>(null)
  const [unassigningMentorUid, setUnassigningMentorUid] = useState<string | null>(null)

  const onRequestUnassignMentor = useCallback((mentor: ICourseMentorItem) => {
    if (!enabled) return
    setPendingUnassignMentor(mentor)
  }, [enabled])

  const onCancelUnassignMentor = useCallback(() => {
    setPendingUnassignMentor(null)
  }, [])

  const onConfirmUnassignMentor = useCallback(async () => {
    if (!enabled || !pendingUnassignMentor) return

    setUnassigningMentorUid(pendingUnassignMentor.uid)
    try {
      await unassignMentors.mutateAsync({
        courseUid,
        payload: { mentor_uids: [pendingUnassignMentor.uid] },
      })
      setPendingUnassignMentor(null)
    } finally {
      setUnassigningMentorUid(null)
    }
  }, [courseUid, enabled, pendingUnassignMentor, unassignMentors])

  return {
    pendingUnassignMentor,
    onRequestUnassignMentor,
    onCancelUnassignMentor,
    onConfirmUnassignMentor,
    unassigningMentorUid,
  }
}
