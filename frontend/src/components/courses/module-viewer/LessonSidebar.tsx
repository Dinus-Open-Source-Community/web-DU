import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { IModulesDetail } from '@/lib/types/course'
import { Sheet, SheetContent } from '@/components/ui/sheet'

import { type LessonEntry, type LessonThemeMode } from './utils'
import { LessonSidebarPanel } from './LessonSidebarPanel'

type LessonSidebarProps = {
  modules: IModulesDetail[]
  lessonEntries: LessonEntry[]
  activeModuleId?: string
  activeLessonId: string | null
  readLessonIds: ReadonlySet<string>
  completedLessonsCount: number
  progressPercent: number
  expandedModules: Set<string>
  isOpen: boolean
  isMobileOpen: boolean
  theme: LessonThemeMode
  onToggleSidebar: () => void
  onMobileOpenChange: (open: boolean) => void
  onToggleModule: (moduleId: string) => void
  onSelectLesson: (lessonId: string, moduleId: string) => void
}

export function LessonSidebar({
  modules,
  lessonEntries,
  activeModuleId,
  activeLessonId,
  readLessonIds,
  completedLessonsCount,
  progressPercent,
  expandedModules,
  isOpen,
  isMobileOpen,
  theme,
  onToggleSidebar,
  onMobileOpenChange,
  onToggleModule,
  onSelectLesson,
}: LessonSidebarProps) {
  const isDark = theme === 'dark'

  const panelProps = {
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
    onSelectLesson: (lessonId: string, moduleId: string) => {
      onSelectLesson(lessonId, moduleId)
      onMobileOpenChange(false)
    },
  }

  return (
    <>
      <aside
        className={cn(
          'fixed right-0 top-16 z-30 hidden h-[calc(100dvh-4rem)] w-[348px] border-l transition-transform duration-200 ease-out lg:block',
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

        <LessonSidebarPanel {...panelProps} />
      </aside>

      {!isOpen && (
        <button
          type="button"
          onClick={onToggleSidebar}
          className="fixed right-6 top-20 z-30 hidden h-8 w-8 items-center justify-center rounded-lg border border-primary/70 bg-primary text-white transition focus:outline-none focus:ring-2 focus:ring-primary/30 lg:flex"
          aria-label="Buka daftar modul">
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      <Sheet open={isMobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent
          side="right"
          className={cn(
            'flex h-dvh w-full max-w-[348px] flex-col gap-0 border-l p-0 sm:max-w-[348px] lg:hidden',
            isDark ? 'border-zinc-800 bg-zinc-900 text-zinc-100' : 'border-slate-200 bg-white text-slate-950',
          )}>
          <LessonSidebarPanel {...panelProps} />
        </SheetContent>
      </Sheet>
    </>
  )
}
