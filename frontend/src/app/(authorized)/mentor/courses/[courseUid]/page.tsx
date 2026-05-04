import { Suspense } from 'react'
import { CourseHubClient } from './_components/CourseHubClient'

type MentorCourseHubPageProps = {
  params: Promise<{ courseUid: string }>
}

export default async function MentorCourseHubPage({ params }: MentorCourseHubPageProps) {
  const { courseUid } = await params
  if (!courseUid) return null

  return (
    <Suspense
      fallback={
        <section className="space-y-6 py-10">
          <div className="h-48 animate-pulse rounded-2xl bg-slate-100" />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        </section>
      }>
      <CourseHubClient courseUid={courseUid} />
    </Suspense>
  )
}
