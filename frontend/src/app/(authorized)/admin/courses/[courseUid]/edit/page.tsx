import { CourseEditClient } from '../../../../mentor/courses/[courseUid]/edit/_components/CourseEditClient'

type AdminCourseEditPageProps = {
  params: Promise<{ courseUid: string }>
  searchParams?: Promise<{ moduleId?: string }>
}

export default async function AdminCourseEditPage({ params, searchParams }: AdminCourseEditPageProps) {
  const { courseUid } = await params
  const query = searchParams ? await searchParams : undefined

  return <CourseEditClient courseUid={courseUid} initialModuleId={query?.moduleId} routeBasePath="/admin" role="admin" />
}
