import type { AssignmentHistoryPolicyViewModel } from '@/lib/lesson-assignment/submission-history'
import { cn } from '@/lib/utils'

import type { LessonThemeMode } from '@/lib/course-module-viewer/lesson-viewer-utils'

type AssignmentPolicyMetaProps = {
  policy: AssignmentHistoryPolicyViewModel
  theme: LessonThemeMode
}

function MetaItem({
  label,
  value,
  isDark,
}: {
  label: string
  value: string
  isDark: boolean
}) {
  return (
    <span className="inline-flex min-w-0 items-baseline gap-1.5">
      <span className={cn('shrink-0 text-xs', isDark ? 'text-zinc-500' : 'text-slate-400')}>
        {label}
      </span>
      <span className={cn('text-xs font-medium', isDark ? 'text-zinc-300' : 'text-slate-700')}>
        {value}
      </span>
    </span>
  )
}

export function AssignmentPolicyMeta({ policy, theme }: AssignmentPolicyMetaProps) {
  const isDark = theme === 'dark'

  const items = [
    { label: 'Metode', value: policy.submissionMethodsLabel },
    { label: 'Ulang', value: policy.resubmitPolicyLabel },
    { label: 'Kelulusan', value: policy.passingScoreLabel ?? 'Dinilai mentor' },
  ]

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-x-3 gap-y-1.5',
        isDark ? 'text-zinc-400' : 'text-slate-500',
      )}
      aria-label="Aturan pengumpulan tugas"
    >
      {items.map((item, index) => (
        <span key={item.label} className="inline-flex min-w-0 items-center gap-3">
          {index > 0 ? (
            <span
              className={cn('hidden size-1 shrink-0 rounded-full sm:inline-block', isDark ? 'bg-zinc-700' : 'bg-slate-300')}
              aria-hidden
            />
          ) : null}
          <MetaItem label={item.label} value={item.value} isDark={isDark} />
        </span>
      ))}
    </div>
  )
}
