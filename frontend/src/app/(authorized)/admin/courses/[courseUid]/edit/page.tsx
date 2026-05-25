import { Suspense } from 'react'
import { CourseEditClient } from '@/app/(authorized)/mentor/courses/[courseUid]/edit/_components/CourseEditClient'

type AdminCourseEditPageProps = {
  params: Promise<{ courseUid: string }>
  searchParams?: Promise<{ moduleId?: string }>
}

export default async function AdminCourseEditPage({ params, searchParams }: AdminCourseEditPageProps) {
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
      <CourseEditClient courseUid={courseUid} initialModuleId={query?.moduleId} routeBasePath="/admin" role="admin" />
    </Suspense>
  )
}
