import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'

import type { LessonEntry } from './utils'
import type { LessonThemeMode } from './utils'

type LessonFooterProps = {
  activeTitle: string
  previousEntry: LessonEntry | null
  nextEntry: LessonEntry | null
  isSidebarOpen: boolean
  theme: LessonThemeMode
  onSelectLesson: (lessonId: string, moduleId: string) => void
}

export function LessonFooter({ activeTitle, previousEntry, nextEntry, isSidebarOpen, theme, onSelectLesson }: LessonFooterProps) {
  const isDark = theme === 'dark'

  return (
    <footer
      className={cn(
        'fixed bottom-0 left-0 z-40 flex h-[76px] items-center justify-between border-t px-6 transition-[right] duration-200',
        isDark ? 'border-zinc-800 bg-zinc-950 text-zinc-100' : 'border-slate-200 bg-white text-slate-950',
        isSidebarOpen ? 'right-[348px]' : 'right-0',
      )}>
      <button
        type="button"
        disabled={!previousEntry}
        onClick={() => previousEntry && onSelectLesson(previousEntry.lesson.uid, previousEntry.module.uid)}
        className={cn('group flex min-w-0 max-w-[34%] items-center gap-3 px-2 py-2 text-left transition disabled:cursor-not-allowed disabled:opacity-40', isDark ? 'hover:text-white' : 'hover:text-primary')}>
        <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition', isDark ? 'border-zinc-700 bg-zinc-900 group-hover:border-zinc-500' : 'border-slate-200 bg-slate-50 group-hover:border-slate-300')}>
          <ChevronLeft className="h-4 w-4" />
        </span>
        <span className="min-w-0">
          <span className={cn('block text-[11px] font-semibold uppercase', isDark ? 'text-zinc-500' : 'text-slate-400')}>Sebelumnya</span>
          <span className="block truncate text-sm font-semibold">{previousEntry?.lesson.title ?? 'Tidak ada lesson sebelumnya'}</span>
        </span>
      </button>

      <p className={cn('hidden max-w-[26%] truncate border px-4 py-2 text-center text-sm font-semibold md:block', isDark ? 'border-zinc-800 bg-zinc-900 text-zinc-300' : 'border-slate-200 bg-slate-50 text-slate-600')}>{activeTitle}</p>

      <button
        type="button"
        disabled={!nextEntry}
        onClick={() => nextEntry && onSelectLesson(nextEntry.lesson.uid, nextEntry.module.uid)}
        className={cn('group flex min-w-0 max-w-[34%] items-center justify-end gap-3 px-2 py-2 text-right transition disabled:cursor-not-allowed disabled:opacity-40', isDark ? 'hover:text-white' : 'hover:text-primary')}>
        <span className="min-w-0">
          <span className={cn('block text-[11px] font-semibold uppercase', isDark ? 'text-zinc-500' : 'text-slate-400')}>Selanjutnya</span>
          <span className="block truncate text-sm font-semibold">{nextEntry?.lesson.title ?? 'Tidak ada lesson selanjutnya'}</span>
        </span>
        <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition', isDark ? 'border-zinc-700 bg-zinc-900 group-hover:border-zinc-500' : 'border-slate-200 bg-slate-50 group-hover:border-slate-300')}>
          <ChevronRight className="h-4 w-4" />
        </span>
      </button>
    </footer>
  )
}
