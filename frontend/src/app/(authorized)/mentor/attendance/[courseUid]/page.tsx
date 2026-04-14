'use client'

import { useParams } from 'next/navigation'
import { MentorAttendanceCourseClient } from '../_components/MentorAttendanceCourseClient'

export default function MentorAttendanceCoursePage() {
  const params = useParams<{ courseUid: string }>()
  const courseUid = Array.isArray(params.courseUid) ? params.courseUid[0] : params.courseUid

  if (!courseUid) return null

  return <MentorAttendanceCourseClient courseUid={courseUid} />
}
