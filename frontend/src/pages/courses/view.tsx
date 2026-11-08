import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import { Message } from '@/lib/Message'
import { CourseModulePreview } from '@/components/courses/(authorized)/viewModuleAndLessons'
import { NotFoundContent } from '@/components/shared/Error'
import { LessonViewerSkeleton } from '@/components/courses/module-viewer/LessonViewerSkeleton'
import { useCourseModuleViewer } from '@/hooks/course-module-viewer/use-course-module-viewer'
import { useCourseDetail } from '@/hooks/use-course'
import { useLessonByUid } from '@/hooks/use-lessons'
import { useModulesByCourse } from '@/hooks/use-modules'
import { useStudentMyAssignments } from '@/hooks/student-assignments/use-student-my-assignments'
import { isCoursePublished } from '@/lib/course-detail/publish-state'
import { flattenLessons } from '@/lib/course-module-viewer/lesson-viewer-utils'
import { getCourseModuleViewerBackHref, type CourseModulePreviewVariant } from '@/lib/course-module-viewer/navigation'
import type { CourseViewerPane } from '@/lib/lesson-assignment/types'
import { toShortUid } from '@/lib/routes'
import type { ICourseDetailItem, IModulesDetail } from '@/lib/types/course'
import { useAuth } from '@/providers/auth-provider'
import { useAppTheme } from '@/providers/theme-provider'

export default function CourseViewPage() {
  const { courseUid, lessonUid } = useParams()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const { theme } = useAppTheme()
  const [loadedCourseUid, setLoadedCourseUid] = useState<string | null>(null)

  const initialLessonUid = lessonUid ?? searchParams.get('lesson')
  const initialViewerPane: CourseViewerPane | null =
    searchParams.get('pane') === 'assignment' ? 'assignment' : null

  const isStudent = user?.role === 'student'
  const courseDetail = useCourseDetail(courseUid ?? '')
  const modulesQuery = useModulesByCourse(courseUid ?? '', { per_page: 100 })
  const initialLessonQuery = useLessonByUid(initialLessonUid ?? '')
  useStudentMyAssignments(
    { course_uid: courseUid ?? '' },
    { fetchAll: true, enabled: isStudent && Boolean(courseUid) },
  )

  const storedModules = useMemo<IModulesDetail[]>(
    () =>
      (modulesQuery.data?.modules ?? []).map((module) => ({
        ...module,
        lessons: module.lessons ?? [],
      })),
    [modulesQuery.data?.modules],
  )

  const lessonEntries = useMemo(() => flattenLessons(storedModules), [storedModules])

  const effectiveInitialLesson = useMemo(() => {
    if (lessonEntries.length === 0) return null
    if (initialLessonUid) {
      const matched = lessonEntries.find(
        (entry) =>
          toShortUid(entry.lesson.uid) === toShortUid(initialLessonUid) ||
          entry.lesson.uid === initialLessonUid,
      )
      if (matched) return matched.lesson
    }
    return lessonEntries[0]?.lesson ?? null
  }, [initialLessonUid, lessonEntries])

  const fallbackLessonUid =
    effectiveInitialLesson?.uid && effectiveInitialLesson.uid !== initialLessonUid
      ? effectiveInitialLesson.uid
      : ''
  const fallbackLessonQuery = useLessonByUid(fallbackLessonUid)

  const initialLessonDetail = initialLessonQuery.data ?? fallbackLessonQuery.data
  const isInitialLessonPending = Boolean(
    (initialLessonUid && initialLessonQuery.isLoading) ||
      (fallbackLessonUid && fallbackLessonQuery.isLoading),
  )

  const isCourseLoading = courseDetail.isLoading || modulesQuery.isLoading
  const hasLoadedCurrentCourse = Boolean(courseUid && loadedCourseUid === courseUid)

  const courseWithModules = useMemo<ICourseDetailItem | null>(() => {
    if (!courseUid || !courseDetail.data) return null

    return {
      ...(courseDetail.data as ICourseDetailItem),
      modules: storedModules,
    }
  }, [courseDetail.data, courseUid, storedModules])

  useEffect(() => {
    if (courseUid && !isCourseLoading && !isInitialLessonPending && courseWithModules) {
      setLoadedCourseUid(courseUid)
    }
  }, [courseUid, courseWithModules, isCourseLoading, isInitialLessonPending])

  if (isCourseLoading || (!hasLoadedCurrentCourse && isInitialLessonPending)) {
    return (
      <LessonViewerSkeleton
        backHref={getCourseModuleViewerBackHref(
          (user?.role ?? 'student') as CourseModulePreviewVariant,
          courseUid ?? '',
        )}
        theme={theme}
        lessonType={initialLessonDetail?.content_type ?? effectiveInitialLesson?.content_type}
        pane={initialViewerPane ?? 'lesson'}
        taskType={
          initialLessonDetail?.assignment?.task_type ??
          effectiveInitialLesson?.assignment?.task_type
        }
      />
    )
  }

  if (!courseUid || !courseWithModules) {
    return <NotFoundContent />
  }

  if (isStudent && !isCoursePublished(courseWithModules)) {
    return <NotFoundContent />
  }

  return (
    <CourseViewPageContent
      courseUid={courseUid}
      variant={user?.role as CourseModulePreviewVariant}
      mentorCourse={courseWithModules}
      storedModules={storedModules}
      initialLessonUid={initialLessonUid}
      initialViewerPane={initialViewerPane}
    />
  )
}

type CourseViewPageContentProps = {
  courseUid: string
  variant: CourseModulePreviewVariant
  mentorCourse: ICourseDetailItem
  storedModules: IModulesDetail[]
  initialLessonUid: string | null
  initialViewerPane: CourseViewerPane | null
}

function CourseViewPageContent({
  courseUid,
  variant,
  mentorCourse,
  storedModules,
  initialLessonUid,
  initialViewerPane,
}: CourseViewPageContentProps) {
  const handleSubmitAssignmentSuccess = useCallback(() => {
    toast.success(Message.assignment.submitted)
  }, [])

  const handleSubmitAssignmentError = useCallback((message: string) => {
    toast.error(message)
  }, [])

  const view = useCourseModuleViewer({
    courseUid,
    variant,
    mentorCourse,
    storedModules,
    initialLessonUid,
    initialViewerPane,
    onSubmitAssignmentSuccess: handleSubmitAssignmentSuccess,
    onSubmitAssignmentError: handleSubmitAssignmentError,
  })

  return <CourseModulePreview view={view} />
}
