import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toShortUid } from '@/lib/routes'

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
  hasResolvedLessonDetail,
  isActiveLessonDetailPending,
  resolveActiveLessonDetail,
} from '@/lib/course-module-viewer/resolve-active-lesson'
import { useLessonDetails } from '@/hooks/course-module-viewer/use-lesson-details'
import { useQueries } from '@tanstack/react-query'
import { fetchLessonsByModuleUid } from '@/services/lessons'
import { lessonKeys } from '@/hooks/query-keys'
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
import { shouldOpenAssignmentAfterLesson } from '@/lib/lesson-assignment/navigation'
import { isAssignmentVisibleToStudent } from '@/lib/lesson-assignment/submission-status'
import type { SubmitLessonAssignmentPayload } from '@/lib/lesson-assignment/submission-draft'
import { useOptionalNavbarSearch } from '@/providers/navbar-search-provider'
import { useAppTheme } from '@/providers/theme-provider'
import { useStudentMyAssignments } from '@/hooks/student-assignments/use-student-my-assignments'

export function getViewerPath(
  pathname: string,
  courseUid: string,
  lessonUid?: string | null,
  pane?: CourseViewerPane | null,
): string {
  const shortCourse = toShortUid(courseUid)
  const shortLesson = lessonUid ? toShortUid(lessonUid) : null
  const isDashboard = pathname.startsWith('/dashboard/learning/courses')

  let targetPath = isDashboard
    ? shortLesson
      ? `/dashboard/learning/courses/${shortCourse}/${shortLesson}`
      : `/dashboard/learning/courses/${shortCourse}`
    : shortLesson
      ? `/course/${shortCourse}/view/${shortLesson}`
      : `/course/${shortCourse}/view`

  if (pane && pane !== 'lesson') {
    targetPath += '?pane=assignment'
  }
  return targetPath
}

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
  const location = useLocation()
  const navigate = useNavigate()
  const searchContext = useOptionalNavbarSearch()
  const localSearchInputRef = useRef<HTMLInputElement>(null)
  const { theme } = useAppTheme()

  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isLocalSearchOpen, setIsLocalSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewerPane, setViewerPane] = useState<CourseViewerPane>('lesson')
  const initialLessonQuery = useLessonByUid(initialLessonUid ?? '')

  const trackLessonReading = variant === 'student'
  const isStudent = variant === 'student'
  const studentAssignmentsQuery = useStudentMyAssignments(
    { course_uid: courseUid },
    { fetchAll: true, enabled: isStudent && Boolean(courseUid) },
  )
  const courseTitle = mentorCourse?.title ?? repoCourse?.title ?? ''
  const moduleIdsToLoad = useMemo(() => {
    const firstModuleId = storedModules?.[0]?.uid
    const ids = new Set(expandedModules)
    const initialModuleId = initialLessonQuery.data?.module_uid
    if (initialModuleId) ids.add(initialModuleId)
    if (firstModuleId && ids.size === 0) ids.add(firstModuleId)
    return [...ids]
  }, [expandedModules, initialLessonQuery.data?.module_uid, storedModules])
  const loadedModuleQueries = useQueries({
    queries: moduleIdsToLoad.map((moduleUid) => ({
      queryKey: lessonKeys.byModule(moduleUid, { per_page: 100 }),
      queryFn: () => fetchLessonsByModuleUid(moduleUid, { per_page: 100 }),
      enabled: Boolean(moduleUid),
    })),
  })
  const modulesState = useMemo(
    () =>
      (storedModules ?? []).map((module) => ({
        ...module,
        lessons:
          loadedModuleQueries[moduleIdsToLoad.indexOf(module.uid)]?.data?.lessons ?? module.lessons ?? [],
      })),
    [loadedModuleQueries, moduleIdsToLoad, storedModules],
  )
  const lessonEntries = useMemo(() => flattenLessons(modulesState), [modulesState])
  const lessonUids = useMemo(
    () => lessonEntries.map((entry) => entry.lesson.uid),
    [lessonEntries],
  )
  const lessonDetails = useLessonDetails(lessonUids, !isStudent)
  const matchedEntry = useMemo(() => {
    if (!initialLessonUid || lessonEntries.length === 0) return null
    return (
      lessonEntries.find(
        (entry) =>
          toShortUid(entry.lesson.uid) === toShortUid(initialLessonUid) ||
          entry.lesson.uid === initialLessonUid,
      ) ?? null
    )
  }, [initialLessonUid, lessonEntries])

  // Single source of truth: URL > fallback ke materi pertama
  const effectiveActiveLessonId =
    matchedEntry?.lesson.uid ?? (initialLessonUid ? null : lessonEntries[0]?.lesson.uid ?? null)
  const hasCachedActiveLessonDetail = Boolean(
    effectiveActiveLessonId && lessonDetails.detailsByUid.has(effectiveActiveLessonId),
  )
  const shouldFetchActiveLessonDetail =
    isStudent && Boolean(effectiveActiveLessonId) && !hasCachedActiveLessonDetail
  const activeEntry = useMemo(
    () => lessonEntries.find((entry) => entry.lesson.uid === effectiveActiveLessonId) ?? null,
    [effectiveActiveLessonId, lessonEntries],
  )
  const activeLesson = activeEntry?.lesson ?? null

  const lessonDetailQuery = useLessonByUid(
    shouldFetchActiveLessonDetail || !isStudent ? (effectiveActiveLessonId ?? '') : '',
  )
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

  const resolvedActiveLesson = useMemo(
    () =>
      resolveActiveLessonDetail(
        effectiveActiveLessonId,
        lessonDetails.detailsByUid,
        lessonDetailQuery.data,
        activeLesson,
        { allowListFallback: !isStudent },
      ),
    [
      activeLesson,
      effectiveActiveLessonId,
      isStudent,
      lessonDetailQuery.data,
      lessonDetails.detailsByUid,
    ],
  )

  const isActiveLessonDetailLoading = isActiveLessonDetailPending(
    effectiveActiveLessonId,
    lessonDetails.detailsByUid,
    lessonDetailQuery.data,
    lessonDetails.isActiveDetailLoading(effectiveActiveLessonId),
    lessonDetailQuery.isLoading || lessonDetailQuery.isFetching,
  )

  const displayedLesson = resolvedActiveLesson
  const isAssignmentPane =
    viewerPane === 'assignment' ||
    viewerPane === 'assignment-detail' ||
    viewerPane === 'assignment-work'
  const assignmentLesson = resolvedActiveLesson
  const assignmentHookState = useLessonAssignment({
    lesson: assignmentLesson,
    enabled: isStudent && Boolean(assignmentLesson),
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

  const handleViewerPaneChange = useCallback(
    (nextPane: CourseViewerPane) => {
      setViewerPane(nextPane)
      if (effectiveActiveLessonId) {
        const targetUrl = getViewerPath(
          location.pathname,
          courseUid,
          effectiveActiveLessonId,
          nextPane,
        )
        const currentUrl = location.pathname + (location.search || '')
        if (currentUrl !== targetUrl) {
          navigate(targetUrl, { replace: true })
        }
      }
    },
    [courseUid, effectiveActiveLessonId, location.pathname, location.search, navigate],
  )

  const selectLesson = useCallback(
    (lessonId: string, moduleId?: string) => {
      const targetModuleId =
        moduleId ?? lessonEntries.find((entry) => entry.lesson.uid === lessonId)?.module.uid

      setViewerPane('lesson')
      if (targetModuleId) {
        setExpandedModules(new Set([targetModuleId]))
      }
      setIsLocalSearchOpen(false)
      setSearchQuery('')

      const targetUrl = getViewerPath(location.pathname, courseUid, lessonId, 'lesson')
      const currentUrl = location.pathname + (location.search || '')
      if (currentUrl !== targetUrl) {
        navigate(targetUrl)
      }
    },
    [courseUid, lessonEntries, location.pathname, location.search, navigate],
  )

  const selectAssignment = useCallback(
    (lessonId: string, moduleId?: string) => {
      const targetModuleId =
        moduleId ?? lessonEntries.find((entry) => entry.lesson.uid === lessonId)?.module.uid

      setViewerPane('assignment')
      if (targetModuleId) {
        setExpandedModules(new Set([targetModuleId]))
      }
      setIsLocalSearchOpen(false)
      setSearchQuery('')

      const targetUrl = getViewerPath(location.pathname, courseUid, lessonId, 'assignment')
      const currentUrl = location.pathname + (location.search || '')
      if (currentUrl !== targetUrl) {
        navigate(targetUrl)
      }
    },
    [courseUid, lessonEntries, location.pathname, location.search, navigate],
  )

  const navigateToLessonEntry = useCallback(
    (entry: LessonEntry) => {
      selectLesson(entry.lesson.uid, entry.module.uid)
    },
    [selectLesson],
  )

  const navigateToAssignmentEntry = useCallback(
    (entry: LessonEntry) => {
      selectAssignment(entry.lesson.uid, entry.module.uid)
    },
    [selectAssignment],
  )

  const navigateToLearningHome = useCallback(() => {
    navigate(backHref)
  }, [backHref, navigate])

  const assignmentByLessonUid = useMemo(() => {
    const map = new Map<string, NonNullable<LessonEntry['lesson']['assignment']>>()
    for (const entry of lessonEntries) {
      const detailed = lessonDetails.detailsByUid.get(entry.lesson.uid)
      const candidate = detailed?.assignment ?? entry.lesson.assignment
      if (!candidate) continue
      // Student hanya melihat tugas yang terbit; mentor/admin melihat semua (termasuk draf) untuk pratinjau.
      if (isStudent ? isAssignmentVisibleToStudent(candidate) : true) {
        map.set(entry.lesson.uid, candidate)
      }
    }
    return map
  }, [isStudent, lessonEntries, lessonDetails.detailsByUid])

  const previousEntryAssignment = previousEntry
    ? (assignmentByLessonUid.get(previousEntry.lesson.uid) ?? null)
    : null

  const footerHandlers = useMemo(
    () => ({
      setViewerPane: handleViewerPaneChange,
      navigateToLessonEntry,
      navigateToAssignmentEntry,
      ...(isStudent ? { navigateToLearningHome } : {}),
    }),
    [handleViewerPaneChange, isStudent, navigateToAssignmentEntry, navigateToLearningHome, navigateToLessonEntry],
  )

  // Otomatis buka accordion modul yang memuat materi aktif
  useEffect(() => {
    if (!matchedEntry) return
    setExpandedModules((prev) =>
      prev.has(matchedEntry.module.uid) ? prev : new Set([...prev, matchedEntry.module.uid]),
    )
  }, [matchedEntry])

  // Inisialisasi pane jika ada query param ?pane=assignment pada URL
  useEffect(() => {
    if (!hasAppliedInitialUrlState.current) {
      hasAppliedInitialUrlState.current = true
      if (initialViewerPane === 'assignment') {
        setViewerPane('assignment')
      }
    }
  }, [initialViewerPane])

  // Redirect otomatis hanya jika URL belum memuat lessonUid, atau lessonUid tidak valid
  useEffect(() => {
    if (lessonEntries.length === 0) return

    // 1. Jika URL tidak memuat lessonUid, arahkan ke lesson pertama dengan short UID
    if (!initialLessonUid) {
      const firstLessonUid = lessonEntries[0]?.lesson.uid
      if (firstLessonUid) {
        const targetUrl = getViewerPath(
          location.pathname,
          courseUid,
          firstLessonUid,
          initialViewerPane,
        )
        navigate(targetUrl, { replace: true })
      }
      return
    }

    // 2. Jika URL memuat lessonUid tetapi tidak cocok dengan lesson manapun, fallback ke lesson pertama
    if (!matchedEntry) {
      const firstLessonUid = lessonEntries[0]?.lesson.uid
      if (firstLessonUid) {
        const targetUrl = getViewerPath(
          location.pathname,
          courseUid,
          firstLessonUid,
          initialViewerPane,
        )
        navigate(targetUrl, { replace: true })
      }
    }
  }, [
    courseUid,
    initialLessonUid,
    initialViewerPane,
    lessonEntries,
    location.pathname,
    matchedEntry,
    navigate,
  ])

  const lastMarkedLessonIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!trackLessonReading || !effectiveActiveLessonId) return
    if (lastMarkedLessonIdRef.current === effectiveActiveLessonId) return
    lastMarkedLessonIdRef.current = effectiveActiveLessonId
    void markLessonIfUnread(effectiveActiveLessonId)
  }, [effectiveActiveLessonId, markLessonIfUnread, trackLessonReading])

  const searchItems = useMemo(
    () =>
      buildLessonSearchItems(lessonEntries, selectLesson, selectAssignment, assignmentByLessonUid),
    [assignmentByLessonUid, lessonEntries, selectAssignment, selectLesson],
  )

  const filteredSearchItems = useMemo(
    () => filterLessonSearchItems(searchItems, searchQuery),
    [searchItems, searchQuery],
  )

  const toggleModule = useCallback((moduleId: string) => {
    setExpandedModules((prev) => {
      if (prev.has(moduleId)) return new Set()
      return new Set([moduleId])
    })
  }, [])

  const footerPreviousAction = useMemo(
    () =>
      buildFooterPreviousAction(viewerPane, displayedLesson, previousEntry, footerHandlers, {
        previousEntryHasAssignment: Boolean(previousEntryAssignment),
        previousEntryAssignmentTitle: previousEntryAssignment?.title,
      }),
    [displayedLesson, footerHandlers, previousEntry, previousEntryAssignment, viewerPane],
  )

  const canStepToAssignment =
    viewerPane === 'lesson' &&
    (isStudent
      ? shouldOpenAssignmentAfterLesson(displayedLesson, viewerPane)
      : Boolean(displayedLesson?.assignment))

  const footerNextAction = useMemo(() => {
    if (viewerPane === 'lesson' && isActiveLessonDetailLoading) {
      return {
        label: 'Selanjutnya',
        title: 'Memuat tugas...',
        disabled: true,
      }
    }

    return buildFooterNextAction(viewerPane, variant, displayedLesson, nextEntry, footerHandlers, {
      hasAssignmentStep: canStepToAssignment,
      assignmentTitle: displayedLesson?.assignment?.title,
    })
  }, [
    canStepToAssignment,
    displayedLesson,
    footerHandlers,
    isActiveLessonDetailLoading,
    nextEntry,
    variant,
    viewerPane,
  ])

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
      placeholder: 'Cari modul atau konten...',
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

  const hasResolvedAssignmentLesson = hasResolvedLessonDetail(
    effectiveActiveLessonId,
    lessonDetails.detailsByUid,
    lessonDetailQuery.data,
  )

  const showAssignmentOverview =
    viewerPane === 'assignment' &&
    hasResolvedAssignmentLesson &&
    Boolean(assignmentState.assignment && assignmentLesson)

  const showAssignmentDetail =
    isStudent &&
    viewerPane === 'assignment-detail' &&
    hasResolvedAssignmentLesson &&
    Boolean(assignmentState.assignment && assignmentState.submission && assignmentLesson)

  const showAssignmentWork =
    isStudent &&
    viewerPane === 'assignment-work' &&
    hasResolvedAssignmentLesson &&
    Boolean(assignmentState.assignment && assignmentLesson)

  const isAssignmentLoading =
    isAssignmentPane && !hasResolvedAssignmentLesson && isActiveLessonDetailLoading

  const isAssignmentReadOnly = !isStudent

  const submittedAssignmentIds = useMemo(() => {
    const ids = new Set<string>()

    // 1. From student assignments query (live list)
    const assignmentItems = studentAssignmentsQuery.data?.assignments ?? []
    for (const item of assignmentItems) {
      if (item.latest_submission) {
        if (item.assignment?.uid) ids.add(item.assignment.uid)
        if (item.assignment?.lesson_uid) ids.add(item.assignment.lesson_uid)
      }
    }

    // 2. From active assignmentState submission
    if (assignmentState.submission) {
      if (assignmentState.assignment?.uid) ids.add(assignmentState.assignment.uid)
      if (assignmentLesson?.uid) ids.add(assignmentLesson.uid)
    }

    return ids
  }, [
    studentAssignmentsQuery.data?.assignments,
    assignmentState.submission,
    assignmentState.assignment?.uid,
    assignmentLesson?.uid,
  ])

  return {
    courseUid,
    variant,
    courseTitle,
    backHref,
    theme,
    modulesState,
    lessonEntries,
    effectiveActiveLessonId,
    activeEntry,
    displayedLesson,
    isLessonLoading: isStudent
      ? isActiveLessonDetailLoading
      : lessonDetailQuery.isLoading && !lessonDetailQuery.data,
    isAssignmentLoading,
    readLessonIds,
    submittedAssignmentIds,
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
    assignmentByLessonUid,
    isAssignmentReadOnly,
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
    onOpenModules: () => setIsMobileSidebarOpen(true),
    onToggleSidebar: () => setIsRightSidebarOpen((open) => !open),
    onMobileSidebarOpenChange: setIsMobileSidebarOpen,
    onToggleModule: toggleModule,
    onSelectLesson: selectLesson,
    onSelectAssignment: selectAssignment,
    onSearchQueryChange: setSearchQuery,
    onCloseSearch: () => setIsLocalSearchOpen(false),
    onViewerPaneChange: handleViewerPaneChange,
    onSubmitAssignment: handleSubmitAssignment,
    mentorCourse,
    repoCourse,
  }
}
