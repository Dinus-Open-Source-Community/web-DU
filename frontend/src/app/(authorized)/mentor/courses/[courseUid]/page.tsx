'use client'

import { useParams } from 'next/navigation'
import { CoursePreviewClient } from './_components/CoursePreviewClient'

export default function MentorCoursePreviewPage() {
  const params = useParams<{ courseUid: string }>()
  const courseUid = Array.isArray(params.courseUid) ? params.courseUid[0] : params.courseUid

  if (!courseUid) return null

  return <CoursePreviewClient courseUid={courseUid} />
}
