import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'

import type { LessonThemeMode } from '@/lib/course-module-viewer/lesson-viewer-utils'

export type LessonFooterNavAction = {
  label: string
  title: string
  disabled?: boolean
  onClick?: () => void
}

type LessonFooterProps = {
  activeTitle: string
  previousAction: LessonFooterNavAction | null
  nextAction: LessonFooterNavAction | null
  theme: LessonThemeMode
}

export function LessonFooter({
  activeTitle,
  previousAction,
  nextAction,
  theme,
}: LessonFooterProps) {
  const isDark = theme === 'dark'

  return (
    <footer
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 border-t pb-[env(safe-area-inset-bottom)]',
        isDark ? 'border-zinc-800 bg-zinc-950 text-zinc-100' : 'border-slate-200 bg-white text-slate-950',
      )}>
      <div className="flex min-h-[4.25rem] items-center justify-between gap-2 px-3 py-2 sm:min-h-[4.75rem] sm:gap-3 sm:px-6 sm:py-0">
        <button
          type="button"
          disabled={!previousAction || previousAction.disabled}
          aria-label={previousAction ? `${previousAction.label}: ${previousAction.title}` : 'Tidak ada halaman sebelumnya'}
          onClick={() => previousAction?.onClick?.()}
          className={cn(
            'group flex min-w-0 max-w-[42%] items-center gap-2 px-1 py-1 text-left transition disabled:cursor-not-allowed disabled:opacity-40 sm:max-w-[34%] sm:gap-3 sm:px-2 sm:py-2',
            isDark ? 'hover:text-white' : 'hover:text-primary',
          )}>
          <span
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition sm:h-9 sm:w-9',
              isDark ? 'border-zinc-700 bg-zinc-900 group-hover:border-zinc-500' : 'border-slate-200 bg-slate-50 group-hover:border-slate-300',
            )}>
            <ChevronLeft className="h-4 w-4" />
          </span>
          <span className="min-w-0 hidden sm:block">
            <span className={cn('block text-[11px] font-semibold uppercase', isDark ? 'text-zinc-500' : 'text-slate-400')}>
              {previousAction?.label ?? 'Sebelumnya'}
            </span>
            <span className="block truncate text-sm font-semibold">
              {previousAction?.title ?? 'Tidak ada halaman sebelumnya'}
            </span>
          </span>
        </button>

        <p
          className={cn(
            'hidden max-w-[26%] truncate border px-3 py-1.5 text-center text-xs font-semibold md:block md:px-4 md:py-2 md:text-sm',
            isDark ? 'border-zinc-800 bg-zinc-900 text-zinc-300' : 'border-slate-200 bg-slate-50 text-slate-600',
          )}>
          {activeTitle}
        </p>

        <button
          type="button"
          disabled={!nextAction || nextAction.disabled}
          aria-label={nextAction ? `${nextAction.label}: ${nextAction.title}` : 'Tidak ada halaman selanjutnya'}
          onClick={() => nextAction?.onClick?.()}
          className={cn(
            'group flex min-w-0 max-w-[42%] items-center justify-end gap-2 px-1 py-1 text-right transition disabled:cursor-not-allowed disabled:opacity-40 sm:max-w-[34%] sm:gap-3 sm:px-2 sm:py-2',
            isDark ? 'hover:text-white' : 'hover:text-primary',
          )}>
          <span className="min-w-0 hidden text-right sm:block">
            <span className={cn('block text-[10px] font-semibold uppercase sm:text-[11px]', isDark ? 'text-zinc-500' : 'text-slate-400')}>
              {nextAction?.label ?? 'Selanjutnya'}
            </span>
            <span className="block truncate text-xs font-semibold sm:text-sm">
              {nextAction?.title ?? 'Tidak ada halaman selanjutnya'}
            </span>
          </span>
          <span
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition sm:h-9 sm:w-9',
              isDark ? 'border-zinc-700 bg-zinc-900 group-hover:border-zinc-500' : 'border-slate-200 bg-slate-50 group-hover:border-slate-300',
            )}>
            <ChevronRight className="h-4 w-4" />
          </span>
        </button>
      </div>
    </footer>
  )
}
