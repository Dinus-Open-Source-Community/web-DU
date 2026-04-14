'use client'

import { useParams } from 'next/navigation'
import { CourseModulePreview } from '@/components/course/CourseModulePreview'

export default function StudentCoursePreviewPage() {
  const params = useParams<{ courseUid: string }>()
  const courseUid = Array.isArray(params.courseUid) ? params.courseUid[0] : params.courseUid

  if (!courseUid) return null

  return <CourseModulePreview courseUid={courseUid} variant="student" />
}
