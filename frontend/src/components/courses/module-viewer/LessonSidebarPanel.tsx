import { CheckCircle2, ChevronDown, ChevronRight, Circle } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { IModulesDetail } from '@/lib/types/course'
import { formatLearningProgress } from '@/lib/learning/progress'

import { getLessonIcon, isModuleComplete, type LessonEntry, type LessonThemeMode, moduleProgress } from '@/lib/course-module-viewer/lesson-viewer-utils'

type LessonSidebarPanelProps = {
  modules: IModulesDetail[]
  lessonEntries: LessonEntry[]
  activeModuleId?: string
  activeLessonId: string | null
  readLessonIds: ReadonlySet<string>
  completedLessonsCount: number
  progressPercent: number
  expandedModules: Set<string>
  theme: LessonThemeMode
  onToggleModule: (moduleId: string) => void
  onSelectLesson: (lessonId: string, moduleId: string) => void
}

export function LessonSidebarPanel({
  modules,
  lessonEntries,
  activeModuleId,
  activeLessonId,
  readLessonIds,
  completedLessonsCount,
  progressPercent,
  expandedModules,
  theme,
  onToggleModule,
  onSelectLesson,
}: LessonSidebarPanelProps) {
  const isDark = theme === 'dark'

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className={cn('border-b px-4 py-4 sm:px-5 sm:py-5', isDark ? 'border-zinc-800' : 'border-slate-200')}>
        <h2 className={cn('text-base font-semibold', isDark ? 'text-zinc-50' : 'text-slate-950')}>Daftar Modul</h2>
        <p className={cn('mt-1 text-sm', isDark ? 'text-zinc-400' : 'text-slate-500')}>
          {completedLessonsCount}/{lessonEntries.length} konten selesai
        </p>
      </div>

      <div className={cn('border-b px-4 py-3 sm:px-5 sm:py-4', isDark ? 'border-zinc-800' : 'border-slate-200')}>
        <div className="flex items-center justify-between gap-3">
          <p className={cn('text-sm font-medium', isDark ? 'text-zinc-300' : 'text-slate-600')}>Progress belajar</p>
          <span className="text-sm font-semibold text-primary tabular-nums">{formatLearningProgress(progressPercent)}%</span>
        </div>
        <div className={cn('mt-3 h-1.5 overflow-hidden rounded-full', isDark ? 'bg-zinc-800' : 'bg-slate-200')}>
          <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2 sm:px-3 sm:py-3">
        {modules.map((mod) => {
          const isExpanded = expandedModules.has(mod.uid)
          const progress = moduleProgress(mod, readLessonIds)
          const moduleDone = isModuleComplete(mod, readLessonIds)
          const isCurrentModule = activeModuleId === mod.uid
          const ModuleChevron = isExpanded ? ChevronDown : ChevronRight

          return (
            <section
              key={mod.uid}
              className={cn(
                'border-b py-2 last:border-b-0',
                isDark ? 'border-zinc-800' : 'border-slate-200',
                isCurrentModule && (isDark ? 'bg-zinc-800/60' : 'bg-slate-50'),
              )}>
              <button
                type="button"
                onClick={() => onToggleModule(mod.uid)}
                className={cn(
                  'flex w-full items-start gap-3 px-3 py-3 text-left transition',
                  isDark ? 'hover:bg-zinc-800' : 'hover:bg-slate-50',
                )}>
                <ModuleChevron aria-hidden className={cn('mt-1 h-4 w-4 shrink-0', isDark ? 'text-zinc-400' : 'text-slate-400')} />
                <span className="flex min-w-0 flex-1 items-start gap-2">
                  {moduleDone ? (
                    <CheckCircle2
                      aria-hidden
                      className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                    />
                  ) : null}
                  <span className={cn('min-w-0 text-sm font-semibold leading-6', isDark ? 'text-zinc-100' : 'text-slate-900')}>
                    {mod.title}
                  </span>
                </span>
                <span
                  className={cn(
                    'shrink-0 text-xs font-medium tabular-nums',
                    moduleDone ? 'font-semibold text-primary' : isDark ? 'text-zinc-400' : 'text-slate-500',
                  )}
                  aria-label={
                    moduleDone
                      ? `Modul selesai, ${progress.completedCount} dari ${progress.totalCount} lesson`
                      : `${progress.completedCount} dari ${progress.totalCount} lesson selesai`
                  }>
                  {progress.completedCount}/{progress.totalCount}
                </span>
              </button>

              {isExpanded && (
                <div className={cn('ml-6 border-l pb-2 pl-4', isDark ? 'border-zinc-700' : 'border-slate-200')}>
                  {(mod.lessons ?? []).map((lesson, lessonIndex) => {
                    const isActive = lesson.uid === activeLessonId
                    const isDone = readLessonIds.has(lesson.uid)
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
                        <span
                          className={cn(
                            'absolute -left-[23px] top-3 flex h-3.5 w-3.5 items-center justify-center',
                            isDark ? (isCurrentModule ? 'bg-zinc-800' : 'bg-zinc-900') : isCurrentModule ? 'bg-slate-50' : 'bg-white',
                          )}>
                          {isDone ? (
                            <CheckCircle2 aria-hidden className="h-3.5 w-3.5 text-primary" />
                          ) : (
                            <Circle
                              aria-hidden
                              className={cn('h-2.5 w-2.5', isDark ? 'fill-zinc-500 text-zinc-500' : 'fill-slate-400 text-slate-400')}
                            />
                          )}
                        </span>
                        <LessonIcon
                          aria-hidden
                          className={cn('mt-1 h-4 w-4 shrink-0', isActive ? 'text-primary' : isDark ? 'text-zinc-500' : 'text-slate-400')}
                        />
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
  )
}
