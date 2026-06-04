import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import '@/styles/tiptap-editor.css'
import { useOptionalNavbarSearch } from '@/providers/navbar-search-provider'
import type { ICourseDetailItem, IModulesDetail } from '@/lib/types/course'
import type { ICardData } from '@/lib/types/utils'
import { LessonContent } from '../module-viewer/LessonContent'
import { LessonFooter } from '../module-viewer/LessonFooter'
import { LessonSearchDialog } from '../module-viewer/LessonSearchDialog'
import { LessonSidebar } from '../module-viewer/LessonSidebar'
import { LessonThemeDialog } from '../module-viewer/LessonThemeDialog'
import { LessonViewerHeader } from '../module-viewer/LessonViewerHeader'
import { flattenLessons, getLessonIcon, type LessonThemeMode } from '../module-viewer/utils'
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
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true)
  const [isLocalSearchOpen, setIsLocalSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const localSearchInputRef = useRef<HTMLInputElement>(null)

  const courseTitle = mentorCourse?.title ?? repoCourse?.title ?? ''
  const modulesState = useMemo(() => storedModules ?? [], [storedModules])
  const lessonEntries = useMemo(() => flattenLessons(modulesState), [modulesState])
  const effectiveActiveLessonId = activeLessonId ?? lessonEntries[0]?.lesson.uid ?? null

  const activeEntry = useMemo(() => lessonEntries.find((entry) => entry.lesson.uid === effectiveActiveLessonId) ?? null, [effectiveActiveLessonId, lessonEntries])
  const activeLesson = activeEntry?.lesson ?? null
  const activeIndex = useMemo(() => lessonEntries.findIndex((entry) => entry.lesson.uid === effectiveActiveLessonId), [effectiveActiveLessonId, lessonEntries])
  const previousEntry = activeIndex > 0 ? lessonEntries[activeIndex - 1] : null
  const nextEntry = activeIndex >= 0 && activeIndex < lessonEntries.length - 1 ? lessonEntries[activeIndex + 1] : null
  const completedLessons = activeIndex >= 0 ? activeIndex + 1 : 0
  const progressPercent = lessonEntries.length > 0 ? Math.round((completedLessons / lessonEntries.length) * 100) : 0
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
      if (targetModuleId) {
        setExpandedModules((prev) => new Set(prev).add(targetModuleId))
      }
      setIsLocalSearchOpen(false)
      setSearchQuery('')
    },
    [lessonEntries],
  )

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
      />

      <LessonContent lesson={activeLesson} theme={theme} />

      <LessonSidebar
        modules={modulesState}
        lessonEntries={lessonEntries}
        activeModuleId={activeEntry?.module.uid}
        activeLessonId={effectiveActiveLessonId}
        completedLessons={completedLessons}
        progressPercent={progressPercent}
        expandedModules={effectiveExpandedModules}
        isOpen={isRightSidebarOpen}
        theme={theme}
        onToggleSidebar={() => setIsRightSidebarOpen((open) => !open)}
        onToggleModule={toggleModule}
        onSelectLesson={selectLesson}
      />

      <LessonFooter activeTitle={activeLesson?.title ?? courseTitle} previousEntry={previousEntry} nextEntry={nextEntry} isSidebarOpen={isRightSidebarOpen} theme={theme} onSelectLesson={selectLesson} />

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
