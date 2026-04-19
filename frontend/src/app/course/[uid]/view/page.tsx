'use client'

import { useParams } from 'next/navigation'
import { CourseModulePreview } from '@/components/course/CourseModulePreview'
import { useUser } from '@/hooks/useUser'

export default function CourseViewPage() {
  const params = useParams<{ uid: string }>()
  const courseUid = Array.isArray(params.uid) ? params.uid[0] : params.uid
  const user = useUser()
  if (!courseUid) return null

  return <CourseModulePreview courseUid={courseUid} variant={user.role} />
}
