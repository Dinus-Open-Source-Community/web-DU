import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { IModulesDetail } from '@/lib/types/course'
import { Sheet, SheetContent } from '@/components/ui/sheet'

import {
  LESSON_SIDEBAR_WIDTH_PX,
  type LessonEntry,
  type LessonThemeMode,
} from '@/lib/course-module-viewer/lesson-viewer-utils'
import { LessonSidebarPanel } from './LessonSidebarPanel'

/** Lebar tab toggle — harus sama dengan sisa wrapper saat sidebar tertutup. */
const LESSON_SIDEBAR_TOGGLE_PX = 28

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

  const toggleTabClass = cn(
    'absolute top-1/2 z-40 flex -translate-y-1/2 items-center justify-center',
    'h-14 w-7 rounded-r-lg border border-l-0 shadow-md transition focus:outline-none focus:ring-2 focus:ring-primary/30',
    isOpen
      ? isDark
        ? 'border-zinc-800 bg-zinc-900 text-zinc-100 hover:bg-zinc-800'
        : 'border-line-light bg-paper-white text-primary hover:bg-paper-white'
      : isDark
        ? 'border-zinc-600 bg-zinc-800 text-zinc-100 hover:bg-zinc-700'
        : 'border-line-medium bg-paper-white text-primary hover:bg-paper-paper',
  )

  return (
    <>
      <div
        className="fixed top-16 left-0 z-30 hidden h-[calc(100dvh-4rem)] transition-transform duration-200 ease-out will-change-transform lg:block"
        style={{
          width: LESSON_SIDEBAR_WIDTH_PX + LESSON_SIDEBAR_TOGGLE_PX,
          transform: isOpen ? 'translateX(0)' : `translateX(-${LESSON_SIDEBAR_WIDTH_PX}px)`,
        }}
      >
        <aside
          className={cn(
            'absolute top-0 left-0 flex h-full flex-col overflow-hidden border-r',
            isDark ? 'border-zinc-800 bg-zinc-900 text-zinc-100' : 'border-line-light bg-paper-white text-ink-900',
          )}
          style={{ width: LESSON_SIDEBAR_WIDTH_PX }}
        >
          <LessonSidebarPanel {...panelProps} />
        </aside>

        <button
          type="button"
          onClick={onToggleSidebar}
          className={toggleTabClass}
          style={{ left: LESSON_SIDEBAR_WIDTH_PX }}
          aria-label={isOpen ? 'Sembunyikan daftar modul' : 'Buka daftar modul'}
          aria-expanded={isOpen}
        >
          {isOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </button>
      </div>

      <Sheet open={isMobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent
          side="left"
          className={cn(
            'flex h-dvh w-full max-w-[348px] flex-col gap-0 overflow-hidden border-r p-0 sm:max-w-[348px] lg:hidden',
            isDark ? 'border-zinc-800 bg-zinc-900 text-zinc-100' : 'border-line-light bg-paper-white text-ink-900',
          )}
        >
          <LessonSidebarPanel {...panelProps} />
        </SheetContent>
      </Sheet>
    </>
  )
}
