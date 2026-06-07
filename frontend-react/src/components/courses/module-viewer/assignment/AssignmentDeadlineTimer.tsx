import { Clock3, TimerOff } from 'lucide-react'

import { useAssignmentDeadlineTimer } from '@/hooks/use-assignment-deadline-timer'
import type { LessonDetailAssignment } from '@/lib/types/lesson'
import { cn } from '@/lib/utils'

import type { LessonThemeMode } from '../utils'

type AssignmentDeadlineTimerProps = {
  deadlineAt: string
  status?: LessonDetailAssignment['status']
  theme: LessonThemeMode
  className?: string
}

export function AssignmentDeadlineTimer({
  deadlineAt,
  status,
  theme,
  className,
}: AssignmentDeadlineTimerProps) {
  const { remainingLabel, isExpired } = useAssignmentDeadlineTimer(deadlineAt)
  const isDark = theme === 'dark'
  const isClosed = status === 'DITUTUP'
  const showExpired = isClosed || isExpired

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex min-w-[6.5rem] max-w-[12rem] items-center justify-between gap-2 rounded-full border px-3 py-2 transition-colors duration-300 ease-out',
        showExpired
          ? isDark
            ? 'border-zinc-800/90 bg-zinc-900/70'
            : 'border-slate-200/90 bg-slate-50/90'
          : isDark
            ? 'border-zinc-700 bg-zinc-900 text-zinc-100'
            : 'border-slate-200 bg-white text-slate-900',
        className,
      )}>
      <span
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors duration-300',
          showExpired
            ? isDark
              ? 'bg-zinc-800 text-zinc-500'
              : 'bg-slate-100 text-slate-400'
            : isDark
              ? 'bg-zinc-800 text-zinc-300'
              : 'bg-slate-100 text-slate-500',
        )}>
        {showExpired ? (
          <TimerOff className="h-3.5 w-3.5" aria-hidden />
        ) : (
          <Clock3 className="h-3.5 w-3.5" aria-hidden />
        )}
      </span>

      <span
        className={cn(
          'text-sm font-medium leading-tight transition-colors duration-300',
          showExpired
            ? isDark
              ? 'text-zinc-400'
              : 'text-slate-500'
            : isDark
              ? 'text-zinc-100'
              : 'text-slate-900',
        )}>
        {isClosed ? 'Ditutup' : isExpired ? 'Waktu habis' : remainingLabel}
      </span>
    </div>
  )
}
