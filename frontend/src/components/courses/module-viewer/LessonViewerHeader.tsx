import { ArrowLeft, List, Search, Settings } from 'lucide-react'
import { Link } from 'react-router-dom'

import { cn } from '@/lib/utils'

import type { LessonThemeMode } from './utils'

type LessonViewerHeaderProps = {
  backHref: string
  courseTitle: string
  theme: LessonThemeMode
  onOpenSearch: () => void
  onOpenThemeSettings: () => void
  onOpenModules?: () => void
}

export function LessonViewerHeader({
  backHref,
  courseTitle,
  theme,
  onOpenSearch,
  onOpenThemeSettings,
  onOpenModules,
}: LessonViewerHeaderProps) {
  const isDark = theme === 'dark'

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 flex h-14 items-center gap-2 border-b px-4 sm:h-16 sm:gap-3 sm:px-6',
        isDark ? 'border-zinc-800 bg-zinc-950 text-zinc-100' : 'border-slate-200 bg-white text-slate-950',
      )}>
      <Link
        to={backHref}
        className={cn(
          'flex min-w-0 flex-1 items-center gap-2 text-sm font-semibold transition sm:flex-none sm:max-w-[min(100%,320px)]',
          isDark ? 'hover:text-white' : 'hover:text-primary',
        )}>
        <ArrowLeft className="h-5 w-5 shrink-0" />
        <span className="truncate">{courseTitle}</span>
      </Link>

      <div className="ml-auto hidden w-[320px] lg:block">
        <button
          type="button"
          onClick={onOpenSearch}
          className={cn(
            'flex h-10 w-full items-center gap-3 rounded-lg border px-3 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-primary/30',
            isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500 hover:bg-zinc-800' : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white',
          )}>
          <Search className={cn('h-4 w-4', isDark ? 'text-zinc-400' : 'text-slate-400')} />
          <span className="min-w-0 flex-1 truncate">Cari modul/konten</span>
          <span className={cn('flex items-center gap-1 text-[11px] font-semibold', isDark ? 'text-zinc-500' : 'text-slate-400')}>
            <kbd className={cn('rounded border px-1.5 py-0.5', isDark ? 'border-zinc-700 bg-zinc-950' : 'border-slate-200 bg-white')}>CTRL</kbd>
            <kbd className={cn('rounded border px-1.5 py-0.5', isDark ? 'border-zinc-700 bg-zinc-950' : 'border-slate-200 bg-white')}>K</kbd>
          </span>
        </button>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-3">
        <button
          type="button"
          onClick={onOpenSearch}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-primary/30 sm:h-10 sm:w-10 lg:hidden',
            isDark
              ? 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100'
              : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-white hover:text-slate-900',
          )}
          aria-label="Cari modul atau konten">
          <Search className="h-4 w-4" />
        </button>

        {onOpenModules ? (
          <button
            type="button"
            onClick={onOpenModules}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-primary/30 sm:h-10 sm:w-10 lg:hidden',
              isDark
                ? 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100'
                : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-white hover:text-slate-900',
            )}
            aria-label="Buka daftar modul">
            <List className="h-4 w-4" />
          </button>
        ) : null}

        <button
          type="button"
          onClick={onOpenThemeSettings}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-primary/30 sm:h-10 sm:w-10',
            isDark
              ? 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100'
              : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-white hover:text-slate-900',
          )}
          aria-label="Ubah mode membaca">
          <Settings className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}
