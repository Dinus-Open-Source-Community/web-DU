import { Suspense } from 'react'
import { MentorCourseAssignmentsClient } from './_components/MentorCourseAssignmentsClient'

type MentorCourseAssignmentsPageProps = {
  params: Promise<{ courseUid: string }>
}

export default async function MentorCourseAssignmentsPage({ params }: MentorCourseAssignmentsPageProps) {
  const { courseUid } = await params
  if (!courseUid) return null

  return (
    <Suspense
      fallback={
        <section className="flex flex-col gap-4 px-4 py-10 sm:px-6">
          <p className="text-sm text-slate-500">Memuat kelola tugas…</p>
        </section>
      }>
      <MentorCourseAssignmentsClient courseUid={courseUid} />
    </Suspense>
  )
}
