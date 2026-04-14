import { Suspense } from 'react'
import { StudentAssignmentsSection } from './_components/StudentAssignmentsSection'

export default function StudentAssignmentsPage() {
  return (
    <Suspense fallback={<p className="px-8 py-10 text-sm text-slate-500">Memuat tugas…</p>}>
      <StudentAssignmentsSection />
    </Suspense>
  )
}
