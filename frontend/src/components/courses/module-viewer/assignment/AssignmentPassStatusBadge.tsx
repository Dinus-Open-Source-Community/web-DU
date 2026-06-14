import type { SubmissionPassOutcome } from '@/lib/lesson-assignment/submission-history'
import { cn } from '@/lib/utils'

import type { LessonThemeMode } from '../utils'

type AssignmentPassStatusBadgeProps = {
  outcome: SubmissionPassOutcome
  label: string
  theme: LessonThemeMode
}

const palette: Record<
  Exclude<SubmissionPassOutcome, 'unavailable'>,
  { light: string; dark: string }
> = {
  passed: {
    light: 'border border-emerald-200/70 bg-emerald-500/10 text-emerald-700',
    dark: 'border border-emerald-500/25 bg-emerald-500/10 text-emerald-300',
  },
  failed: {
    light: 'border border-rose-200/70 bg-rose-500/10 text-rose-700',
    dark: 'border border-rose-500/25 bg-rose-500/10 text-rose-300',
  },
  pending: {
    light: 'border border-amber-200/70 bg-amber-500/10 text-amber-800',
    dark: 'border border-amber-500/25 bg-amber-500/10 text-amber-200',
  },
  graded: {
    light: 'border border-sky-200/70 bg-sky-500/10 text-sky-700',
    dark: 'border border-sky-500/25 bg-sky-500/10 text-sky-300',
  },
}

export function AssignmentPassStatusBadge({ outcome, label, theme }: AssignmentPassStatusBadgeProps) {
  if (outcome === 'unavailable') return null

  const isDark = theme === 'dark'
  const colors = palette[outcome]

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
        isDark ? colors.dark : colors.light,
      )}>
      {label}
    </span>
  )
}
