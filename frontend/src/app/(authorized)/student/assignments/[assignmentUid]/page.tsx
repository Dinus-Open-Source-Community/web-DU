import { Suspense } from 'react'
import { StudentAssignmentDetailGate } from './_components/StudentAssignmentDetailGate'

export default function StudentAssignmentDetailPage() {
  return (
    <Suspense fallback={<p className="px-8 py-10 text-sm text-slate-500">Memuat tugas…</p>}>
      <StudentAssignmentDetailGate />
    </Suspense>
  )
}
