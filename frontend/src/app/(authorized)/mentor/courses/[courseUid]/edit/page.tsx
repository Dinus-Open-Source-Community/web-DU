import { CourseEditClient } from './_components/CourseEditClient'

type MentorCourseEditPageProps = {
  params: Promise<{ courseUid: string }>
  searchParams?: Promise<{ moduleId?: string }>
}

export default async function MentorCourseEditPage({ params, searchParams }: MentorCourseEditPageProps) {
  const { courseUid } = await params
  const query = searchParams ? await searchParams : undefined
  return <CourseEditClient courseUid={courseUid} initialModuleId={query?.moduleId} />
}
