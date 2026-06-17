import { useMemo } from 'react'
import { Play } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { canViewSubmissionDetail } from '@/lib/lesson-assignment/assignment-rules'
import {
  buildAssignmentHistoryPolicy,
  buildSubmissionHistoryRows,
} from '@/lib/lesson-assignment/submission-history'
import type { LessonDetailAssignment } from '@/lib/types/lesson'
import type { LessonAssignmentSubmissionRecord } from '@/lib/lesson-assignment/types'
import { cn } from '@/lib/utils'

import { AssignmentSubmissionHistoryTable } from './AssignmentSubmissionHistoryTable'
import type { LessonThemeMode } from '@/lib/course-module-viewer/lesson-viewer-utils'

type AssignmentSubmissionHistorySectionProps = {
  assignment: LessonDetailAssignment
  submission: LessonAssignmentSubmissionRecord | null
  submissionAttempts: LessonAssignmentSubmissionRecord[]
  submissionMaxAttempts?: number | null
  canStart: boolean
  submissionBlockReason?: string | null
  theme: LessonThemeMode
  onStart: () => void
  onViewDetail: () => void
}

export function AssignmentSubmissionHistorySection({
  assignment,
  submission,
  submissionAttempts,
  submissionMaxAttempts,
  canStart,
  submissionBlockReason,
  theme,
  onStart,
  onViewDetail,
}: AssignmentSubmissionHistorySectionProps) {
  const isDark = theme === 'dark'

  const policy = useMemo(
    () => buildAssignmentHistoryPolicy(assignment, submissionMaxAttempts),
    [assignment, submissionMaxAttempts],
  )

  const rows = useMemo(
    () => buildSubmissionHistoryRows(assignment, submissionAttempts, submissionMaxAttempts),
    [assignment, submissionAttempts, submissionMaxAttempts],
  )

  const canViewDetail = canViewSubmissionDetail(submission)

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className={cn('text-base font-semibold tracking-tight', isDark ? 'text-zinc-100' : 'text-slate-900')}>
            Riwayat pengumpulan
          </h2>
          <p className={cn('mt-1 text-sm', isDark ? 'text-zinc-400' : 'text-slate-500')}>
            Lacak percobaan, nilai, dan status pengumpulan Anda.
          </p>
        </div>

        {canStart ? (
          <Button type="button" onClick={onStart} className="w-full shrink-0 rounded-[10px] px-4 sm:w-auto">
            <Play className="h-4 w-4" aria-hidden />
            Mulai tugas
          </Button>
        ) : submissionBlockReason ? (
          <p className={cn('text-sm', isDark ? 'text-zinc-400' : 'text-slate-500')}>
            {submissionBlockReason}
          </p>
        ) : null}
      </div>

      <AssignmentSubmissionHistoryTable
        rows={rows}
        policy={policy}
        theme={theme}
        canViewDetail={canViewDetail}
        onViewDetail={onViewDetail}
      />
    </section>
  )
}
