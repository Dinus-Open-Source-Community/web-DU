'use client'

import { useParams } from 'next/navigation'
import { CourseModulePreview } from '@/components/course/CourseModulePreview'
import { useUser } from '@/hooks/useUser'

export default function CourseViewPage() {
  const params = useParams<{ courseUid: string }>()
  const courseUid = Array.isArray(params.courseUid) ? params.courseUid[0] : params.courseUid
  const user = useUser()
  if (!courseUid) return null

  return <CourseModulePreview courseUid={courseUid} variant={user.role} />
}
