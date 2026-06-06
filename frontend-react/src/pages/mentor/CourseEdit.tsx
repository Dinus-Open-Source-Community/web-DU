import { CourseEditClient } from '@/components/courses/(authorized)/editCourse'
import { AppSidebarProvider } from '@/components/shared/Sidebar'
import { LottieOverlay } from '@/components/shared/Loader'
import { NotFoundContent } from '@/components/shared/Error'
import type { ICourseDetailItem } from '@/lib/types/course'
import { useSidebarUser } from '@/hooks/use-sidebar-user'
import { useCourseEditModules } from '@/hooks/use-course'
import { useParams, useSearchParams } from 'react-router-dom'

export default function MentorCourseEditPage() {
  const { courseUid } = useParams()
  const [searchParams] = useSearchParams()
  const moduleId = searchParams.get('moduleId') ?? undefined

  const sidebarUser = useSidebarUser('mentor')
  const { courseDetail, modules, isLoading } = useCourseEditModules(
    courseUid ?? '',
  )

  if (isLoading) {
    return (
      <AppSidebarProvider role="mentor" user={sidebarUser}>
        <LottieOverlay visible={isLoading} />
      </AppSidebarProvider>
    )
  }

  if (!courseUid || !courseDetail.data) {
    return (
      <AppSidebarProvider role="mentor" user={sidebarUser}>
        <NotFoundContent />
      </AppSidebarProvider>
    )
  }

  return (
    <AppSidebarProvider role="mentor" user={sidebarUser}>
      <CourseEditClient
        courseData={courseDetail.data as ICourseDetailItem}
        modules={modules}
        initialModuleId={moduleId}
        role="mentor"
      />
    </AppSidebarProvider>
  )
}
