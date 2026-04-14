'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { CARD_PANEL_CLASS } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  getStudentAssignmentDetailAccessDeniedReason,
  getStudentAssignmentFeedRow,
  STUDENT_DEMO_UID,
} from '@/lib/studentAssignmentsData'
import { StudentAssignmentDetailClient } from './StudentAssignmentDetailClient'

export function StudentAssignmentDetailGate() {
  const params = useParams<{ assignmentUid: string }>()
  const assignmentUid = Array.isArray(params.assignmentUid) ? params.assignmentUid[0] : params.assignmentUid
  const [now, setNow] = useState(() => new Date())

  const load = useCallback(() => setNow(new Date()), [])
  useEffect(() => {
    window.addEventListener('focus', load)
    window.addEventListener('storage', load)
    return () => {
      window.removeEventListener('focus', load)
      window.removeEventListener('storage', load)
    }
  }, [load])

  const row = useMemo(
    () => (assignmentUid ? getStudentAssignmentFeedRow(STUDENT_DEMO_UID, assignmentUid, now) : null),
    [assignmentUid, now]
  )

  const deniedReason = useMemo(() => getStudentAssignmentDetailAccessDeniedReason(row, now), [row, now])

  if (!assignmentUid) return null

  if (deniedReason) {
    return (
      <section className="flex min-h-[50vh] w-full flex-col items-center justify-center px-5 py-16 md:px-8">
        <div className={cn(CARD_PANEL_CLASS, 'w-full max-w-md p-8 text-center')}>
          <p className="text-lg font-semibold tracking-tight text-slate-900">Tidak dapat membuka tugas</p>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{deniedReason}</p>
          <Button asChild className="mt-8 h-10 shadow-none">
            <Link href="/student/assignments" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Kembali ke daftar tugas
            </Link>
          </Button>
        </div>
      </section>
    )
  }

  return <StudentAssignmentDetailClient assignmentUid={assignmentUid} />
}
