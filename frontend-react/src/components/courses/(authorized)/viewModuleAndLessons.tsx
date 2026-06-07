import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

import '@/styles/tiptap-editor.css'
import { useCourseLessonReading } from '@/hooks/use-course-lesson-reading'
import { useLessonAssignment } from '@/hooks/use-lesson-assignment'
import { useLessonByUid } from '@/hooks/use-lessons'
import { shouldOpenAssignmentAfterLesson } from '@/lib/lesson-assignment/navigation'
import type { SubmitLessonAssignmentPayload } from '@/lib/lesson-assignment/submission-draft'
import type { CourseViewerPane } from '@/lib/lesson-assignment/types'
import { useOptionalNavbarSearch } from '@/providers/navbar-search-provider'
import type { ICourseDetailItem, IModulesDetail } from '@/lib/types/course'
import type { ICardData } from '@/lib/types/utils'
import { LessonAssignmentDetailPage } from '../module-viewer/assignment/LessonAssignmentDetailPage'
import { LessonAssignmentOverview } from '../module-viewer/assignment/LessonAssignmentOverview'
import { LessonAssignmentWork } from '../module-viewer/assignment/LessonAssignmentWork'
import { LessonContent } from '../module-viewer/LessonContent'
import { LessonFooter } from '../module-viewer/LessonFooter'
import type { LessonFooterNavAction } from '../module-viewer/LessonFooter'
import { LessonSearchDialog } from '../module-viewer/LessonSearchDialog'
import { LessonSidebar } from '../module-viewer/LessonSidebar'
import { LessonThemeDialog } from '../module-viewer/LessonThemeDialog'
import { LessonViewerHeader } from '../module-viewer/LessonViewerHeader'
import { flattenLessons, getLessonIcon, type LessonEntry, type LessonThemeMode } from '../module-viewer/utils'
import { LottieOverlay } from '@/components/shared/Loader'
import { SafeLottie } from '@/components/ui/lottie'
import { cn } from '@/lib/utils'

export type CourseModulePreviewVariant = 'mentor' | 'student' | 'admin'

type CourseModulePreviewProps = {
  courseUid: string
  variant: CourseModulePreviewVariant
  mentorCourse: ICourseDetailItem
  repoCourse?: ICardData
  storedModules: IModulesDetail[]
}

const LESSON_THEME_STORAGE_KEY = 'course-module-viewer-theme'

function getBackHref(variant: CourseModulePreviewVariant, courseUid: string) {
  if (variant === 'mentor') return `/mentor/courses/${courseUid}`
  if (variant === 'admin') return `/admin/courses/${courseUid}`
  return '/student/learning'
}

export function CourseModulePreview({ courseUid, variant, mentorCourse, repoCourse, storedModules }: CourseModulePreviewProps) {
  const searchContext = useOptionalNavbarSearch()
  const [theme, setTheme] = useState<LessonThemeMode>(() => {
    if (typeof window === 'undefined') return 'dark'

    const storedTheme = window.localStorage.getItem(LESSON_THEME_STORAGE_KEY)
    return storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : 'dark'
  })
  const [isThemeDialogOpen, setIsThemeDialogOpen] = useState(() => {
    if (typeof window === 'undefined') return false
    return !window.localStorage.getItem(LESSON_THEME_STORAGE_KEY)
  })
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null)
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isLocalSearchOpen, setIsLocalSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewerPane, setViewerPane] = useState<CourseViewerPane>('lesson')
  const localSearchInputRef = useRef<HTMLInputElement>(null)

  const trackLessonReading = variant === 'student'
  const courseTitle = mentorCourse?.title ?? repoCourse?.title ?? ''
  const modulesState = useMemo(() => storedModules ?? [], [storedModules])
  const lessonEntries = useMemo(() => flattenLessons(modulesState), [modulesState])
  const effectiveActiveLessonId = activeLessonId ?? lessonEntries[0]?.lesson.uid ?? null

  const activeEntry = useMemo(() => lessonEntries.find((entry) => entry.lesson.uid === effectiveActiveLessonId) ?? null, [effectiveActiveLessonId, lessonEntries])
  const activeLesson = activeEntry?.lesson ?? null

  const lessonDetailQuery = useLessonByUid(effectiveActiveLessonId ?? '')
  const { refetch: refetchLessonDetail } = lessonDetailQuery
  const {
    readLessonIds,
    completedLessonsCount,
    progressPercent,
    markLessonIfUnread,
  } = useCourseLessonReading({
    courseUid,
    modules: modulesState,
    enabled: trackLessonReading,
  })
  const displayedLesson = lessonDetailQuery.data ?? activeLesson
  const assignmentState = useLessonAssignment({
    lesson: displayedLesson,
    enabled: variant === 'student',
  })
  const activeIndex = useMemo(() => lessonEntries.findIndex((entry) => entry.lesson.uid === effectiveActiveLessonId), [effectiveActiveLessonId, lessonEntries])
  const previousEntry = activeIndex > 0 ? lessonEntries[activeIndex - 1] : null
  const nextEntry = activeIndex >= 0 && activeIndex < lessonEntries.length - 1 ? lessonEntries[activeIndex + 1] : null
  const backHref = getBackHref(variant, courseUid)

  const effectiveExpandedModules = useMemo(() => {
    if (expandedModules.size > 0) return expandedModules
    const firstModuleId = activeEntry?.module.uid ?? modulesState[0]?.uid
    return firstModuleId ? new Set([firstModuleId]) : expandedModules
  }, [activeEntry?.module.uid, expandedModules, modulesState])

  const selectLesson = useCallback(
    (lessonId: string, moduleId?: string) => {
      const targetModuleId = moduleId ?? lessonEntries.find((entry) => entry.lesson.uid === lessonId)?.module.uid

      setActiveLessonId(lessonId)
      setViewerPane('lesson')
      if (targetModuleId) {
        setExpandedModules((prev) => new Set(prev).add(targetModuleId))
      }
      setIsLocalSearchOpen(false)
      setSearchQuery('')
    },
    [lessonEntries],
  )

  const navigateToLessonEntry = useCallback(
    (entry: LessonEntry) => {
      selectLesson(entry.lesson.uid, entry.module.uid)
    },
    [selectLesson],
  )

  useEffect(() => {
    setViewerPane('lesson')
  }, [effectiveActiveLessonId])

  useEffect(() => {
    if (!trackLessonReading || !effectiveActiveLessonId) return

    void markLessonIfUnread(effectiveActiveLessonId)
  }, [effectiveActiveLessonId, markLessonIfUnread, trackLessonReading])

  useEffect(() => {
    if (variant !== 'student' || !effectiveActiveLessonId) return
    if (viewerPane !== 'assignment' && viewerPane !== 'assignment-work') return

    void refetchLessonDetail()
  }, [effectiveActiveLessonId, refetchLessonDetail, variant, viewerPane])

  const searchItems = useMemo(
    () =>
      lessonEntries.map((entry) => ({
        id: entry.lesson.uid,
        label: entry.lesson.title,
        description: `${entry.module.title} - Lesson ${entry.lessonIndex + 1}`,
        icon: getLessonIcon(entry.lesson.content_type),
        keywords: [entry.module.title, entry.lesson.content_type, String(entry.moduleIndex + 1), String(entry.lessonIndex + 1)],
        onSelect: () => selectLesson(entry.lesson.uid, entry.module.uid),
      })),
    [lessonEntries, selectLesson],
  )

  const filteredSearchItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return searchItems.slice(0, 8)

    return searchItems.filter((item) => [item.label, item.description, ...(item.keywords ?? [])].filter(Boolean).some((value) => value!.toLowerCase().includes(query))).slice(0, 8)
  }, [searchItems, searchQuery])

  function toggleModule(moduleId: string) {
    setExpandedModules((prev) => {
      const next = new Set(prev)
      if (next.has(moduleId)) next.delete(moduleId)
      else next.add(moduleId)
      return next
    })
  }

  function updateTheme(nextTheme: LessonThemeMode) {
    setTheme(nextTheme)
    window.localStorage.setItem(LESSON_THEME_STORAGE_KEY, nextTheme)
  }

  const footerPreviousAction = useMemo<LessonFooterNavAction | null>(() => {
    if (viewerPane === 'assignment-detail') {
      return {
        label: 'Sebelumnya',
        title: displayedLesson?.assignment?.title ?? 'Tugas',
        onClick: () => setViewerPane('assignment'),
      }
    }

    if (viewerPane === 'assignment') {
      return {
        label: 'Sebelumnya',
        title: displayedLesson?.title ?? 'Lesson',
        onClick: () => setViewerPane('lesson'),
      }
    }

    if (viewerPane === 'lesson' && previousEntry) {
      return {
        label: 'Sebelumnya',
        title: previousEntry.lesson.title,
        onClick: () => navigateToLessonEntry(previousEntry),
      }
    }

    return null
  }, [displayedLesson?.title, navigateToLessonEntry, previousEntry, viewerPane])

  const footerNextAction = useMemo<LessonFooterNavAction | null>(() => {
    if (viewerPane === 'assignment-detail' && nextEntry) {
      return {
        label: 'Selanjutnya',
        title: nextEntry.lesson.title,
        onClick: () => navigateToLessonEntry(nextEntry),
      }
    }

    if (viewerPane === 'assignment' && nextEntry) {
      return {
        label: 'Selanjutnya',
        title: nextEntry.lesson.title,
        onClick: () => navigateToLessonEntry(nextEntry),
      }
    }

    if (variant === 'student' && viewerPane === 'lesson' && shouldOpenAssignmentAfterLesson(displayedLesson, viewerPane)) {
      return {
        label: 'Selanjutnya',
        title: displayedLesson?.assignment?.title ?? 'Tugas',
        onClick: () => setViewerPane('assignment'),
      }
    }

    if (viewerPane === 'lesson' && nextEntry) {
      return {
        label: 'Selanjutnya',
        title: nextEntry.lesson.title,
        onClick: () => navigateToLessonEntry(nextEntry),
      }
    }

    return null
  }, [displayedLesson, navigateToLessonEntry, nextEntry, variant, viewerPane])

  const footerActiveTitle = useMemo(() => {
    if (viewerPane === 'assignment-detail') return 'Detail pengumpulan'
    if (viewerPane === 'assignment') return displayedLesson?.assignment?.title ?? 'Tugas'
    return displayedLesson?.title ?? activeLesson?.title ?? courseTitle
  }, [activeLesson?.title, courseTitle, displayedLesson, viewerPane])

  async function handleSubmitAssignment(payload: SubmitLessonAssignmentPayload) {
    try {
      await assignmentState.submitAssignment(payload)
      toast.success('Tugas berhasil dikumpulkan.')
      setViewerPane('assignment')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal mengumpulkan tugas.'
      toast.error(message)
    }
  }

  useEffect(() => {
    if (!searchContext) return undefined

    return searchContext.registerLocalSearch({
      id: `course-module-viewer-${courseUid}`,
      placeholder: 'Cari modul/konten',
      items: searchItems,
      onSearch: (query) => {
        const normalizedQuery = query.trim().toLowerCase()
        const item = searchItems.find((searchItem) =>
          [searchItem.label, searchItem.description, ...(searchItem.keywords ?? [])].filter(Boolean).some((value) => value!.toLowerCase().includes(normalizedQuery)),
        )

        if (item) item.onSelect?.()
      },
    })
  }, [courseUid, searchContext, searchItems])

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setIsLocalSearchOpen(true)
      }
    }

    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])

  useEffect(() => {
    if (!isLocalSearchOpen) return
    window.setTimeout(() => localSearchInputRef.current?.focus(), 0)
  }, [isLocalSearchOpen])

  if (courseTitle === undefined || !modulesState) {
    return <LottieOverlay visible />
  }

  if (courseTitle === null) {
    return <SafeLottie src="/transaction-not-found" className="w-full h-full flex items-center justify-center p-4" />
  }

  return (
    <section className={cn('relative min-h-dvh overflow-hidden', theme === 'dark' ? 'bg-zinc-950 text-zinc-100' : 'bg-white text-slate-950')}>
      <LessonViewerHeader
        backHref={backHref}
        courseTitle={courseTitle}
        theme={theme}
        onOpenSearch={() => setIsLocalSearchOpen(true)}
        onOpenThemeSettings={() => setIsThemeDialogOpen(true)}
        onOpenModules={() => setIsMobileSidebarOpen(true)}
      />

      <div
        className={cn(
          'transition-[margin-right] duration-200 ease-out',
          isRightSidebarOpen && 'lg:mr-[348px]',
        )}
      >
        {viewerPane === 'lesson' ? (
          <LessonContent
            lesson={displayedLesson}
            theme={theme}
            isLoading={lessonDetailQuery.isLoading && !lessonDetailQuery.data}
          />
        ) : null}

        {variant === 'student' && viewerPane === 'assignment' && assignmentState.assignment && displayedLesson ? (
          <LessonAssignmentOverview
            lesson={displayedLesson}
            assignment={assignmentState.assignment}
            submission={assignmentState.submission}
            phase={assignmentState.phase}
            canStart={assignmentState.canStart}
            submissionBlockReason={assignmentState.submissionBlockReason}
            theme={theme}
            onStart={() => setViewerPane('assignment-work')}
            onViewDetail={() => setViewerPane('assignment-detail')}
          />
        ) : null}

        {variant === 'student' &&
        viewerPane === 'assignment-detail' &&
        assignmentState.assignment &&
        assignmentState.submission &&
        displayedLesson ? (
          <LessonAssignmentDetailPage
            assignment={assignmentState.assignment}
            submission={assignmentState.submission}
            phase={assignmentState.phase}
            quizReview={assignmentState.quizReview}
            theme={theme}
            onBack={() => setViewerPane('assignment')}
          />
        ) : null}

        {variant === 'student' && viewerPane === 'assignment-work' && assignmentState.assignment && displayedLesson ? (
          <LessonAssignmentWork
            lesson={displayedLesson}
            assignment={assignmentState.assignment}
            submission={assignmentState.submission}
            quiz={assignmentState.quiz}
            theme={theme}
            isSubmitting={assignmentState.isSubmitting}
            onCancel={() => setViewerPane('assignment')}
            onSubmit={handleSubmitAssignment}
          />
        ) : null}
      </div>

      {viewerPane !== 'assignment-work' && viewerPane !== 'assignment-detail' ? (
        <LessonFooter
          activeTitle={footerActiveTitle}
          previousAction={footerPreviousAction}
          nextAction={footerNextAction}
          theme={theme}
        />
      ) : null}

      <LessonSidebar
        modules={modulesState}
        lessonEntries={lessonEntries}
        activeModuleId={activeEntry?.module.uid}
        activeLessonId={effectiveActiveLessonId}
        readLessonIds={readLessonIds}
        completedLessonsCount={completedLessonsCount}
        progressPercent={progressPercent}
        expandedModules={effectiveExpandedModules}
        isOpen={isRightSidebarOpen}
        isMobileOpen={isMobileSidebarOpen}
        theme={theme}
        onToggleSidebar={() => setIsRightSidebarOpen((open) => !open)}
        onMobileOpenChange={setIsMobileSidebarOpen}
        onToggleModule={toggleModule}
        onSelectLesson={selectLesson}
      />

      <LessonSearchDialog
        open={isLocalSearchOpen}
        query={searchQuery}
        items={filteredSearchItems}
        inputRef={localSearchInputRef}
        theme={theme}
        onQueryChange={setSearchQuery}
        onClose={() => setIsLocalSearchOpen(false)}
      />

      <LessonThemeDialog open={isThemeDialogOpen} value={theme} onOpenChange={setIsThemeDialogOpen} onChange={updateTheme} />
    </section>
  )
}
