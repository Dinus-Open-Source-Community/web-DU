import { CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Circle } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { IModulesDetail } from '@/lib/types/course'

import { getLessonIcon, type LessonEntry, type LessonThemeMode, moduleProgress } from './utils'

type LessonSidebarProps = {
  modules: IModulesDetail[]
  lessonEntries: LessonEntry[]
  activeModuleId?: string
  activeLessonId: string | null
  completedLessons: number
  progressPercent: number
  expandedModules: Set<string>
  isOpen: boolean
  theme: LessonThemeMode
  onToggleSidebar: () => void
  onToggleModule: (moduleId: string) => void
  onSelectLesson: (lessonId: string, moduleId: string) => void
}

export function LessonSidebar({
  modules,
  lessonEntries,
  activeModuleId,
  activeLessonId,
  completedLessons,
  progressPercent,
  expandedModules,
  isOpen,
  theme,
  onToggleSidebar,
  onToggleModule,
  onSelectLesson,
}: LessonSidebarProps) {
  const isDark = theme === 'dark'

  return (
    <>
      <aside
        className={cn(
          'fixed right-0 top-16 z-30 hidden h-[calc(100vh-64px)] w-[348px] border-l transition-transform duration-200 xl:block',
          isDark ? 'border-zinc-800 bg-zinc-900 text-zinc-100' : 'border-slate-200 bg-white text-slate-950',
          !isOpen && 'translate-x-full',
        )}>
        {isOpen && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="absolute -left-10 top-4 flex h-8 w-8 items-center justify-center rounded-lg border border-primary/70 bg-primary text-white transition focus:outline-none focus:ring-2 focus:ring-primary/30"
            aria-label="Sembunyikan daftar modul">
            <ChevronRight className="h-5 w-5" />
          </button>
        )}

        <div className="flex h-full flex-col">
          <div className={cn('border-b px-5 py-5', isDark ? 'border-zinc-800' : 'border-slate-200')}>
            <h2 className={cn('text-base font-semibold', isDark ? 'text-zinc-50' : 'text-slate-950')}>Daftar Modul</h2>
            <p className={cn('mt-1 text-sm', isDark ? 'text-zinc-400' : 'text-slate-500')}>
              {completedLessons}/{lessonEntries.length} konten selesai
            </p>
          </div>

          <div className={cn('border-b px-5 py-4', isDark ? 'border-zinc-800' : 'border-slate-200')}>
            <div className="flex items-center justify-between gap-3">
              <p className={cn('text-sm font-medium', isDark ? 'text-zinc-300' : 'text-slate-600')}>Progress belajar</p>
              <span className="text-sm font-semibold text-primary">{progressPercent}%</span>
            </div>
            <div className={cn('mt-3 h-1.5 overflow-hidden rounded-full', isDark ? 'bg-zinc-800' : 'bg-slate-200')}>
              <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3">
            {modules.map((mod) => {
              const isExpanded = expandedModules.has(mod.uid)
              const progress = moduleProgress(mod, lessonEntries, completedLessons)
              const isCurrentModule = activeModuleId === mod.uid
              const ModuleChevron = isExpanded ? ChevronDown : ChevronRight

              return (
                <section key={mod.uid} className={cn('border-b py-2 last:border-b-0', isDark ? 'border-zinc-800' : 'border-slate-200', isCurrentModule && (isDark ? 'bg-zinc-800/60' : 'bg-slate-50'))}>
                  <button type="button" onClick={() => onToggleModule(mod.uid)} className={cn('flex w-full items-start gap-3 px-3 py-3 text-left transition', isDark ? 'hover:bg-zinc-800' : 'hover:bg-slate-50')}>
                    <ModuleChevron aria-hidden className={cn('mt-1 h-4 w-4 shrink-0', isDark ? 'text-zinc-400' : 'text-slate-400')} />
                    <span className={cn('min-w-0 flex-1 text-sm font-semibold leading-6', isDark ? 'text-zinc-100' : 'text-slate-900')}>{mod.title}</span>
                    <span className={cn('shrink-0 text-xs font-medium', isDark ? 'text-zinc-400' : 'text-slate-500')}>
                      {progress.completedCount}/{progress.totalCount}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className={cn('ml-6 border-l pb-2 pl-4', isDark ? 'border-zinc-700' : 'border-slate-200')}>
                      {(mod.lessons ?? []).map((lesson, lessonIndex) => {
                        const isActive = lesson.uid === activeLessonId
                        const isDone = lessonEntries.findIndex((entry) => entry.lesson.uid === lesson.uid) < completedLessons - 1
                        const LessonIcon = getLessonIcon(lesson.content_type)

                        return (
                          <button
                            key={lesson.uid}
                            type="button"
                            onClick={() => onSelectLesson(lesson.uid, mod.uid)}
                            className={cn(
                              'relative flex w-full items-start gap-3 px-3 py-2 text-left text-sm leading-6 transition',
                              isActive
                                ? isDark
                                  ? 'bg-zinc-800 font-semibold text-zinc-50'
                                  : 'bg-slate-100 font-semibold text-slate-950'
                                : isDark
                                  ? 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
                                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-950',
                            )}>
                            <span className={cn('absolute -left-[23px] top-3 flex h-3.5 w-3.5 items-center justify-center', isDark ? (isCurrentModule ? 'bg-zinc-800' : 'bg-zinc-900') : isCurrentModule ? 'bg-slate-50' : 'bg-white')}>
                              {isActive || isDone ? (
                                <CheckCircle2 aria-hidden className="h-3.5 w-3.5 text-primary" />
                              ) : (
                                <Circle aria-hidden className={cn('h-2.5 w-2.5', isDark ? 'fill-zinc-500 text-zinc-500' : 'fill-slate-400 text-slate-400')} />
                              )}
                            </span>
                            <LessonIcon aria-hidden className={cn('mt-1 h-4 w-4 shrink-0', isActive ? 'text-primary' : isDark ? 'text-zinc-500' : 'text-slate-400')} />
                            <span className="min-w-0 flex-1">{lesson.title}</span>
                            <span className="sr-only">Lesson {lessonIndex + 1}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </section>
              )
            })}
          </div>
        </div>
      </aside>

      {!isOpen && (
        <button
          type="button"
          onClick={onToggleSidebar}
          className="fixed right-6 top-20 z-30 hidden h-8 w-8 items-center justify-center rounded-lg border border-primary/70 bg-primary text-white transition focus:outline-none focus:ring-2 focus:ring-primary/30 xl:flex"
          aria-label="Buka daftar modul">
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
    </>
  )
}
