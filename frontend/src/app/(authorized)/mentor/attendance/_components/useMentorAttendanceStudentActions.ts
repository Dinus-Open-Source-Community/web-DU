import { useMemo } from 'react'
import {
  approveMentorStudentPending,
  rejectMentorStudentPending,
  setMentorStudentEffectiveStatus,
} from '@/lib/mentorAttendanceStorage'
import type { MentorSessionAttendanceStatus } from '@/lib/types'

export function useMentorAttendanceStudentActions(
  courseUid: string,
  isoDate: string,
  studentUid: string,
  onRefresh: () => void
) {
  return useMemo(
    () => ({
      setEffective: (v: MentorSessionAttendanceStatus) => {
        setMentorStudentEffectiveStatus(courseUid, isoDate, studentUid, v)
        onRefresh()
      },
      onApprove: () => {
        approveMentorStudentPending(courseUid, isoDate, studentUid)
        onRefresh()
      },
      onReject: () => {
        rejectMentorStudentPending(courseUid, isoDate, studentUid)
        onRefresh()
      },
    }),
    [courseUid, isoDate, studentUid, onRefresh]
  )
}
