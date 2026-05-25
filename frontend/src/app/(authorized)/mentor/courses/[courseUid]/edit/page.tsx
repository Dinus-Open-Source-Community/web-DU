import { Suspense } from 'react'
import { CourseEditClient } from '@/app/(authorized)/mentor/courses/[courseUid]/edit/_components/CourseEditClient'

type MentorCourseEditPageProps = {
  params: Promise<{ courseUid: string }>
  searchParams?: Promise<{ moduleId?: string }>
}

export default async function MentorCourseEditPage({ params, searchParams }: MentorCourseEditPageProps) {
  const { courseUid } = await params
  const query = searchParams ? await searchParams : undefined
  return (
    <Suspense
      fallback={
        <section className="flex flex-col gap-4 py-10">
          <div className="h-12 w-48 animate-pulse rounded-xl bg-slate-100" />
          <div className="h-80 animate-pulse rounded-2xl bg-slate-100" />
        </section>
      }>
      <CourseEditClient courseUid={courseUid} initialModuleId={query?.moduleId} />
    </Suspense>
  )
}
