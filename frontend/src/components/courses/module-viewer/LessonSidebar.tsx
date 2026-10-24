import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { IModulesDetail } from '@/lib/types/course'
import { Sheet, SheetContent } from '@/components/ui/sheet'

import {
  LESSON_SIDEBAR_WIDTH_PX,
  type LessonThemeMode,
} from '@/lib/course-module-viewer/lesson-viewer-utils'
import type { CourseViewerPane } from '@/lib/lesson-assignment/types'
import type { LessonDetailAssignment } from '@/lib/types/lesson'
import { LessonSidebarPanel } from './LessonSidebarPanel'

/** Lebar tab toggle — harus sama dengan sisa wrapper saat sidebar tertutup. */
const LESSON_SIDEBAR_TOGGLE_PX = 28

type LessonSidebarProps = {
  modules: IModulesDetail[]
  courseUid: string
  courseTitle: string
  activeModuleId?: string
  activeLessonId: string | null
  activePane?: CourseViewerPane
  assignmentByLessonUid?: ReadonlyMap<string, LessonDetailAssignment>
  readLessonIds: ReadonlySet<string>
  submittedAssignmentIds?: ReadonlySet<string>
  progressPercent: number
  expandedModules: Set<string>
  isOpen: boolean
  isMobileOpen: boolean
  theme: LessonThemeMode
  onToggleSidebar: () => void
  onMobileOpenChange: (open: boolean) => void
  onToggleModule: (moduleId: string) => void
  onSelectLesson: (lessonId: string, moduleId: string) => void
  onSelectAssignment?: (lessonId: string, moduleId: string) => void
}

export function LessonSidebar({
  modules,
  courseUid,
  courseTitle,
  activeModuleId,
  activeLessonId,
  activePane,
  assignmentByLessonUid,
  readLessonIds,
  submittedAssignmentIds,
  progressPercent,
  expandedModules,
  isOpen,
  isMobileOpen,
  theme,
  onToggleSidebar,
  onMobileOpenChange,
  onToggleModule,
  onSelectLesson,
  onSelectAssignment,
}: LessonSidebarProps) {
  const isDark = theme === 'dark'

  const panelProps = {
    modules,
    courseUid,
    courseTitle,
    activeModuleId,
    activeLessonId,
    activePane,
    assignmentByLessonUid,
    readLessonIds,
    submittedAssignmentIds,
    progressPercent,
    expandedModules,
    theme,
    onToggleModule,
    onSelectLesson: (lessonId: string, moduleId: string) => {
      onSelectLesson(lessonId, moduleId)
      onMobileOpenChange(false)
    },
    onSelectAssignment: (lessonId: string, moduleId: string) => {
      onSelectAssignment?.(lessonId, moduleId)
      onMobileOpenChange(false)
    },
  }

  return (
    <>
      <div
        className="fixed top-16 left-0 z-30 hidden h-[calc(100dvh-4rem)] transition-transform duration-300 ease-in-out will-change-transform lg:block"
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
          className={cn(
            'group absolute top-1/2 z-40 flex -translate-y-1/2 items-center justify-center',
            'h-12 w-6 rounded-r-lg border border-l-0 transition-all duration-200',
            'cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
            isDark
              ? 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 shadow-[2px_0_6px_rgba(0,0,0,0.3)]'
              : 'border-line-light bg-paper-white text-ink-400 hover:bg-paper-paper hover:text-ink-800 shadow-[2px_0_5px_rgba(15,23,42,0.06)]',
          )}
          style={{ left: LESSON_SIDEBAR_WIDTH_PX - 1 }}
          aria-label={isOpen ? 'Sembunyikan daftar modul' : 'Buka daftar modul'}
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <ChevronLeft className="size-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
          ) : (
            <ChevronRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          )}
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
