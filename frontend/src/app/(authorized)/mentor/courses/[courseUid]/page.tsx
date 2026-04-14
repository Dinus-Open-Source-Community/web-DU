'use client'

import { useParams } from 'next/navigation'
import { CourseHubClient } from './_components/CourseHubClient'

export default function MentorCourseHubPage() {
  const params = useParams<{ courseUid: string }>()
  const courseUid = Array.isArray(params.courseUid) ? params.courseUid[0] : params.courseUid

  if (!courseUid) return null

  return <CourseHubClient courseUid={courseUid} />
}
