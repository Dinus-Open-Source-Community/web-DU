import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  flattenLessons,
  type LessonEntry,
} from '@/lib/course-module-viewer/lesson-viewer-utils'
import { useCourseLessonReading } from '@/hooks/use-course-lesson-reading'
import { useLessonAssignment } from '@/hooks/use-lesson-assignment'
import { useLessonByUid } from '@/hooks/use-lessons'
import {
  buildFooterActiveTitle,
  buildFooterNextAction,
  buildFooterPreviousAction,
} from '@/lib/course-module-viewer/footer-navigation'
import {
  buildLessonSearchItems,
  filterLessonSearchItems,
  findLessonSearchItemByQuery,
} from '@/lib/course-module-viewer/lesson-search-items'
import { getCourseModuleViewerBackHref } from '@/lib/course-module-viewer/navigation'
import type {
  CourseModuleViewerPageInput,
  CourseModuleViewerViewModel,
} from '@/lib/course-module-viewer/course-module-viewer-view-model'
import type { CourseViewerPane } from '@/lib/lesson-assignment/types'
import type { SubmitLessonAssignmentPayload } from '@/lib/lesson-assignment/submission-draft'
import { useOptionalNavbarSearch } from '@/providers/navbar-search-provider'

import { useLessonTheme } from './use-lesson-theme'

export type { CourseModulePreviewVariant } from '@/lib/course-module-viewer/navigation'
export type {
  CourseModuleViewerPageInput,
  CourseModuleViewerViewModel,
} from '@/lib/course-module-viewer/course-module-viewer-view-model'

type UseCourseModuleViewerOptions = CourseModuleViewerPageInput & {
  initialLessonUid?: string | null
  initialViewerPane?: CourseViewerPane | null
  onSubmitAssignmentSuccess?: () => void
  onSubmitAssignmentError?: (message: string) => void
}

export function useCourseModuleViewer({
  courseUid,
  variant,
  mentorCourse,
  repoCourse,
  storedModules,
  initialLessonUid = null,
  initialViewerPane = null,
  onSubmitAssignmentSuccess,
  onSubmitAssignmentError,
}: UseCourseModuleViewerOptions): CourseModuleViewerViewModel {
  const hasAppliedInitialUrlState = useRef(false)
  const searchContext = useOptionalNavbarSearch()
  const localSearchInputRef = useRef<HTMLInputElement>(null)
  const { theme, isThemeDialogOpen, setIsThemeDialogOpen, updateTheme } = useLessonTheme()

  const [activeLessonId, setActiveLessonId] = useState<string | null>(null)
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isLocalSearchOpen, setIsLocalSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewerPane, setViewerPane] = useState<CourseViewerPane>('lesson')

  const trackLessonReading = variant === 'student'
  const courseTitle = mentorCourse?.title ?? repoCourse?.title ?? ''
  const modulesState = useMemo(() => storedModules ?? [], [storedModules])
  const lessonEntries = useMemo(() => flattenLessons(modulesState), [modulesState])
  const effectiveActiveLessonId = activeLessonId ?? lessonEntries[0]?.lesson.uid ?? null
  const activeEntry = useMemo(
    () => lessonEntries.find((entry) => entry.lesson.uid === effectiveActiveLessonId) ?? null,
    [effectiveActiveLessonId, lessonEntries],
  )
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
  const isAssignmentPane =
    viewerPane === 'assignment' ||
    viewerPane === 'assignment-detail' ||
    viewerPane === 'assignment-work'
  const assignmentLesson =
    lessonDetailQuery.data ??
    (isAssignmentPane && (lessonDetailQuery.isPending || lessonDetailQuery.isFetching)
      ? null
      : activeLesson)
  const assignmentHookState = useLessonAssignment({
    lesson: assignmentLesson,
    enabled: variant === 'student' && Boolean(assignmentLesson),
  })

  const activeIndex = useMemo(
    () => lessonEntries.findIndex((entry) => entry.lesson.uid === effectiveActiveLessonId),
    [effectiveActiveLessonId, lessonEntries],
  )
  const previousEntry = activeIndex > 0 ? lessonEntries[activeIndex - 1] : null
  const nextEntry =
    activeIndex >= 0 && activeIndex < lessonEntries.length - 1 ? lessonEntries[activeIndex + 1] : null
  const backHref = getCourseModuleViewerBackHref(variant, courseUid)

  const effectiveExpandedModules = useMemo(() => {
    if (expandedModules.size > 0) return expandedModules
    const firstModuleId = activeEntry?.module.uid ?? modulesState[0]?.uid
    return firstModuleId ? new Set([firstModuleId]) : expandedModules
  }, [activeEntry?.module.uid, expandedModules, modulesState])

  const selectLesson = useCallback(
    (lessonId: string, moduleId?: string) => {
      const targetModuleId =
        moduleId ?? lessonEntries.find((entry) => entry.lesson.uid === lessonId)?.module.uid

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

  const footerHandlers = useMemo(
    () => ({
      setViewerPane,
      navigateToLessonEntry,
    }),
    [navigateToLessonEntry],
  )

  useEffect(() => {
    if (hasAppliedInitialUrlState.current || lessonEntries.length === 0) return
    if (!initialLessonUid) return

    const entry = lessonEntries.find((item) => item.lesson.uid === initialLessonUid)
    if (!entry) return

    hasAppliedInitialUrlState.current = true
    setActiveLessonId(initialLessonUid)
    setExpandedModules((prev) => new Set(prev).add(entry.module.uid))

    if (initialViewerPane === 'assignment') {
      setViewerPane('assignment')
    }
  }, [initialLessonUid, initialViewerPane, lessonEntries])

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
    () => buildLessonSearchItems(lessonEntries, selectLesson),
    [lessonEntries, selectLesson],
  )

  const filteredSearchItems = useMemo(
    () => filterLessonSearchItems(searchItems, searchQuery),
    [searchItems, searchQuery],
  )

  const toggleModule = useCallback((moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev)
      if (next.has(moduleId)) next.delete(moduleId)
      else next.add(moduleId)
      return next
    })
  }, [])

  const footerPreviousAction = useMemo(
    () => buildFooterPreviousAction(viewerPane, displayedLesson, previousEntry, footerHandlers),
    [displayedLesson, footerHandlers, previousEntry, viewerPane],
  )

  const footerNextAction = useMemo(
    () => buildFooterNextAction(viewerPane, variant, displayedLesson, nextEntry, footerHandlers),
    [displayedLesson, footerHandlers, nextEntry, variant, viewerPane],
  )

  const footerActiveTitle = useMemo(
    () =>
      buildFooterActiveTitle(
        viewerPane,
        displayedLesson,
        activeLesson?.title,
        courseTitle,
      ),
    [activeLesson?.title, courseTitle, displayedLesson, viewerPane],
  )

  const handleSubmitAssignment = useCallback(
    async (payload: SubmitLessonAssignmentPayload) => {
      try {
        await assignmentHookState.submitAssignment(payload)
        onSubmitAssignmentSuccess?.()
        setViewerPane('assignment')
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Gagal mengumpulkan tugas.'
        onSubmitAssignmentError?.(message)
      }
    },
    [assignmentHookState, onSubmitAssignmentError, onSubmitAssignmentSuccess],
  )

  useEffect(() => {
    if (!searchContext) return undefined

    return searchContext.registerLocalSearch({
      id: `course-module-viewer-${courseUid}`,
      placeholder: 'Cari modul/konten',
      items: searchItems,
      onSearch: (query) => {
        const item = findLessonSearchItemByQuery(searchItems, query)
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

  const assignmentState = useMemo(
    () => ({
      assignment: assignmentHookState.assignment,
      quiz: assignmentHookState.quiz,
      submission: assignmentHookState.submission,
      submissionAttempts: assignmentHookState.submissionAttempts,
      submissionMaxAttempts: assignmentHookState.submissionMaxAttempts,
      phase: assignmentHookState.phase,
      canStart: assignmentHookState.canStart,
      submissionBlockReason: assignmentHookState.submissionBlockReason,
      quizReview: assignmentHookState.quizReview,
      isSubmitting: assignmentHookState.isSubmitting,
    }),
    [
      assignmentHookState.assignment,
      assignmentHookState.canStart,
      assignmentHookState.isSubmitting,
      assignmentHookState.phase,
      assignmentHookState.quiz,
      assignmentHookState.quizReview,
      assignmentHookState.submission,
      assignmentHookState.submissionAttempts,
      assignmentHookState.submissionMaxAttempts,
      assignmentHookState.submissionBlockReason,
    ],
  )

  const hasResolvedAssignmentLesson = Boolean(lessonDetailQuery.data)

  const showAssignmentOverview =
    variant === 'student' &&
    viewerPane === 'assignment' &&
    hasResolvedAssignmentLesson &&
    Boolean(assignmentState.assignment && assignmentLesson)

  const showAssignmentDetail =
    variant === 'student' &&
    viewerPane === 'assignment-detail' &&
    hasResolvedAssignmentLesson &&
    Boolean(assignmentState.assignment && assignmentState.submission && assignmentLesson)

  const showAssignmentWork =
    variant === 'student' &&
    viewerPane === 'assignment-work' &&
    hasResolvedAssignmentLesson &&
    Boolean(assignmentState.assignment && assignmentLesson)

  const isAssignmentLoading =
    variant === 'student' &&
    isAssignmentPane &&
    !hasResolvedAssignmentLesson &&
    (lessonDetailQuery.isPending || lessonDetailQuery.isFetching)

  return {
    courseUid,
    variant,
    courseTitle,
    backHref,
    theme,
    isThemeDialogOpen,
    onThemeDialogOpenChange: setIsThemeDialogOpen,
    onThemeChange: updateTheme,
    modulesState,
    lessonEntries,
    effectiveActiveLessonId,
    activeEntry,
    displayedLesson,
    isLessonLoading: lessonDetailQuery.isLoading && !lessonDetailQuery.data,
    isAssignmentLoading,
    readLessonIds,
    completedLessonsCount,
    progressPercent,
    effectiveExpandedModules,
    isRightSidebarOpen,
    isMobileSidebarOpen,
    isLocalSearchOpen,
    searchQuery,
    filteredSearchItems,
    localSearchInputRef,
    viewerPane,
    assignmentState,
    footerActiveTitle,
    footerPreviousAction,
    footerNextAction,
    isContentShifted: isRightSidebarOpen,
    showFooter: viewerPane !== 'assignment-work' && viewerPane !== 'assignment-detail',
    showLessonContent: viewerPane === 'lesson',
    showAssignmentOverview,
    showAssignmentDetail,
    showAssignmentWork,
    onOpenSearch: () => setIsLocalSearchOpen(true),
    onOpenThemeSettings: () => setIsThemeDialogOpen(true),
    onOpenModules: () => setIsMobileSidebarOpen(true),
    onToggleSidebar: () => setIsRightSidebarOpen((open) => !open),
    onMobileSidebarOpenChange: setIsMobileSidebarOpen,
    onToggleModule: toggleModule,
    onSelectLesson: selectLesson,
    onSearchQueryChange: setSearchQuery,
    onCloseSearch: () => setIsLocalSearchOpen(false),
    onViewerPaneChange: setViewerPane,
    onSubmitAssignment: handleSubmitAssignment,
    mentorCourse,
    repoCourse,
  }
}
