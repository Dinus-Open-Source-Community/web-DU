import { CourseCreateClient } from './_components/CourseCreateClient'

type MentorCourseCreatePageProps = {
  params: Promise<{ courseUid: string }>
  searchParams?: Promise<{ moduleId?: string }>
}

export default async function MentorCourseCreatePage({ params, searchParams }: MentorCourseCreatePageProps) {
  const { courseUid } = await params
  const query = searchParams ? await searchParams : undefined
  return <CourseCreateClient courseUid={courseUid} initialModuleId={query?.moduleId} />
}
