import { CourseHubClient } from '../../../mentor/courses/[courseUid]/_components/CourseHubClient'

type AdminCourseDetailPageProps = {
  params: Promise<{ courseUid: string }>
}

export default async function AdminCourseDetailPage({ params }: AdminCourseDetailPageProps) {
  const { courseUid } = await params
  if (!courseUid) return null

  return <CourseHubClient courseUid={courseUid} role="admin" />
}
