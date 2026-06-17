import { MessageSquareText } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type {
  AssignmentHistoryPolicyViewModel,
  SubmissionHistoryRowViewModel,
} from '@/lib/lesson-assignment/submission-history'
import { cn } from '@/lib/utils'

import { AssignmentPassStatusBadge } from './AssignmentPassStatusBadge'
import type { LessonThemeMode } from '@/lib/course-module-viewer/lesson-viewer-utils'

type AssignmentSubmissionHistoryTableProps = {
  rows: SubmissionHistoryRowViewModel[]
  policy: AssignmentHistoryPolicyViewModel
  theme: LessonThemeMode
  canViewDetail: boolean
  onViewDetail: () => void
}

function HistoryRowCard({
  row,
  showQuizColumns,
  theme,
  canViewDetail,
  onViewDetail,
}: {
  row: SubmissionHistoryRowViewModel
  showQuizColumns: boolean
  theme: LessonThemeMode
  canViewDetail: boolean
  onViewDetail: () => void
}) {
  const isDark = theme === 'dark'

  return (
    <article
      className={cn(
        'space-y-3 rounded-xl border p-4',
        isDark ? 'border-zinc-800 bg-zinc-900/40' : 'border-slate-200 bg-white',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={cn('text-xs font-medium uppercase tracking-wide', isDark ? 'text-zinc-500' : 'text-slate-500')}>
            Tanggal
          </p>
          <p className={cn('mt-0.5 text-sm font-medium tabular-nums', isDark ? 'text-zinc-100' : 'text-slate-900')}>
            {row.submittedAtLabel}
          </p>
        </div>
        {row.showPassResult && row.passOutcomeLabel ? (
          <AssignmentPassStatusBadge
            outcome={row.passOutcome}
            label={row.passOutcomeLabel}
            theme={theme}
          />
        ) : null}
      </div>

      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className={cn('text-xs', isDark ? 'text-zinc-500' : 'text-slate-500')}>Percobaan</dt>
          <dd className={cn('mt-0.5 font-medium tabular-nums', isDark ? 'text-zinc-200' : 'text-slate-800')}>
            {row.attemptLabel}
          </dd>
        </div>
        <div>
          <dt className={cn('text-xs', isDark ? 'text-zinc-500' : 'text-slate-500')}>Persentase</dt>
          <dd className={cn('mt-0.5 font-medium tabular-nums', isDark ? 'text-zinc-200' : 'text-slate-800')}>
            {row.scoreLabel}
          </dd>
        </div>
        {showQuizColumns ? (
          <div>
            <dt className={cn('text-xs', isDark ? 'text-zinc-500' : 'text-slate-500')}>Benar</dt>
            <dd className={cn('mt-0.5 tabular-nums', isDark ? 'text-zinc-200' : 'text-slate-800')}>
              {row.quizAccuracyLabel ?? '-'}
            </dd>
          </div>
        ) : null}
        <div className={showQuizColumns ? undefined : 'col-span-2'}>
          <dt className={cn('text-xs', isDark ? 'text-zinc-500' : 'text-slate-500')}>Dinilai</dt>
          <dd className={cn('mt-0.5 tabular-nums', isDark ? 'text-zinc-200' : 'text-slate-800')}>
            {row.gradedAtLabel ?? '-'}
          </dd>
        </div>
      </dl>

      {row.hasFeedback ? (
        <p className={cn('inline-flex items-center gap-1 text-xs', isDark ? 'text-zinc-500' : 'text-slate-500')}>
          <MessageSquareText className="h-3 w-3" aria-hidden />
          Ada feedback
        </p>
      ) : null}

      {canViewDetail ? (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onViewDetail}
          className={cn(
            'w-full rounded-lg font-medium',
            isDark
              ? 'border-zinc-700/80 bg-zinc-800/80 text-zinc-100 hover:bg-zinc-700'
              : 'border-slate-200 bg-slate-100/90 text-slate-900 hover:bg-slate-200',
          )}
        >
          Lihat Detail
        </Button>
      ) : null}
    </article>
  )
}

export function AssignmentSubmissionHistoryTable({
  rows,
  policy,
  theme,
  canViewDetail,
  onViewDetail,
}: AssignmentSubmissionHistoryTableProps) {
  const isDark = theme === 'dark'
  const showQuizColumns = policy.taskTypeLabel === 'Kuis'

  const headerClass = cn(
    'px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide sm:px-4',
    isDark ? 'bg-zinc-900/80 text-zinc-400' : 'bg-slate-100/90 text-slate-600',
  )

  const cellClass = cn(
    'px-3 py-3.5 text-sm align-middle sm:px-4',
    isDark ? 'text-zinc-200' : 'text-slate-800',
  )

  const dividerClass = isDark ? 'border-zinc-800/90' : 'border-slate-200/90'

  if (rows.length === 0) {
    return (
      <p
        className={cn(
          'rounded-xl border px-4 py-8 text-center text-sm',
          isDark ? 'border-zinc-800 text-zinc-500' : 'border-slate-200 text-slate-500',
        )}
      >
        Belum ada pengumpulan.
      </p>
    )
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {rows.map((row) => (
          <HistoryRowCard
            key={row.id}
            row={row}
            showQuizColumns={showQuizColumns}
            theme={theme}
            canViewDetail={canViewDetail}
            onViewDetail={onViewDetail}
          />
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead>
            <tr className={cn('border-b', dividerClass)}>
              <th scope="col" className={headerClass}>
                Tanggal
              </th>
              <th scope="col" className={headerClass}>
                Percobaan
              </th>
              <th scope="col" className={headerClass}>
                Persentase
              </th>
              {showQuizColumns ? (
                <th scope="col" className={headerClass}>
                  Benar
                </th>
              ) : null}
              <th scope="col" className={headerClass}>
                Dinilai
              </th>
              <th scope="col" className={headerClass}>
                Status
              </th>
              <th scope="col" className={cn(headerClass, 'text-right')}>
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className={cn('border-b last:border-b-0', dividerClass)}>
                <td className={cellClass}>
                  <p className="tabular-nums">{row.submittedAtLabel}</p>
                  {row.hasFeedback ? (
                    <p
                      className={cn(
                        'mt-1 inline-flex items-center gap-1 text-xs',
                        isDark ? 'text-zinc-500' : 'text-slate-500',
                      )}
                    >
                      <MessageSquareText className="h-3 w-3" aria-hidden />
                      Ada feedback
                    </p>
                  ) : null}
                </td>
                <td className={cn(cellClass, 'font-medium tabular-nums')}>{row.attemptLabel}</td>
                <td className={cn(cellClass, 'font-medium tabular-nums')}>{row.scoreLabel}</td>
                {showQuizColumns ? (
                  <td className={cn(cellClass, 'tabular-nums')}>{row.quizAccuracyLabel ?? '-'}</td>
                ) : null}
                <td className={cn(cellClass, 'tabular-nums')}>{row.gradedAtLabel ?? '-'}</td>
                <td className={cellClass}>
                  {row.showPassResult && row.passOutcomeLabel ? (
                    <AssignmentPassStatusBadge
                      outcome={row.passOutcome}
                      label={row.passOutcomeLabel}
                      theme={theme}
                    />
                  ) : (
                    <span className={isDark ? 'text-zinc-500' : 'text-slate-400'}>-</span>
                  )}
                </td>
                <td className={cn(cellClass, 'text-right')}>
                  {canViewDetail ? (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={onViewDetail}
                      className={cn(
                        'rounded-lg px-4 font-medium',
                        isDark
                          ? 'border-zinc-700/80 bg-zinc-800/80 text-zinc-100 hover:bg-zinc-700'
                          : 'border-slate-200 bg-slate-100/90 text-slate-900 hover:bg-slate-200',
                      )}
                    >
                      Lihat Detail
                    </Button>
                  ) : (
                    <span className={isDark ? 'text-zinc-600' : 'text-slate-300'}>-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
