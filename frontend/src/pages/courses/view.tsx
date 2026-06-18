import { useCallback, useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import { Message } from '@/lib/Message'
import { CourseModulePreview } from '@/components/courses/(authorized)/viewModuleAndLessons'
import { LottieOverlay } from '@/components/shared/Loader'
import { NotFoundContent } from '@/components/shared/Error'
import { useCourseModuleViewer } from '@/hooks/course-module-viewer/use-course-module-viewer'
import { useCourseEditData } from '@/hooks/use-course'
import type { CourseViewerPane } from '@/lib/lesson-assignment/types'
import type { CourseModulePreviewVariant } from '@/lib/course-module-viewer/navigation'
import { useAuth } from '@/providers/auth-provider'
import type { ICourseDetailItem, IModulesDetail } from '@/lib/types/course'

export default function CourseViewPage() {
  const { courseUid } = useParams()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()

  const initialLessonUid = searchParams.get('lesson')
  const initialViewerPane: CourseViewerPane | null =
    searchParams.get('pane') === 'assignment' ? 'assignment' : null

  const { courseDetail, modules, lessonsByModule, isLoading } = useCourseEditData(courseUid ?? '')

  const storedModules = useMemo<IModulesDetail[]>(
    () =>
      modules.map((module) => ({
        ...module,
        lessons: lessonsByModule[module.uid] ?? [],
      })),
    [modules, lessonsByModule],
  )

  const courseWithModules = useMemo<ICourseDetailItem | null>(() => {
    if (!courseUid || !courseDetail.data) return null

    return {
      ...(courseDetail.data as ICourseDetailItem),
      modules: storedModules,
    }
  }, [courseDetail.data, courseUid, storedModules])

  if (isLoading) {
    return <LottieOverlay visible={isLoading} />
  }

  if (!courseUid || !courseWithModules) {
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
