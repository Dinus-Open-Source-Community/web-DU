import { useParams, useSearchParams } from 'react-router-dom'

import type { ICourseDetailItem } from '@/lib/types/course'
import { useSidebarUser } from '@/hooks/use-sidebar-user'
import { useCourseEditModules } from '@/hooks/use-course'
import { useCourseEditController } from '@/hooks/use-course-edit-controller'
import { LottieOverlay } from '@/components/shared/Loader'
import { NotFoundContent } from '@/components/shared/Error'
import { CourseEditClient } from '@/components/courses/(authorized)/editCourse'
import { AppNavbarProvider } from '../../components/shared/Sidebar'

const CourseEdit = () => {
  const { courseUid } = useParams()
  const [searchParams] = useSearchParams()
  const moduleId = searchParams.get('moduleId') ?? undefined

  const sidebarUser = useSidebarUser('admin')
  const { courseDetail, modules, isLoading } = useCourseEditModules(courseUid ?? '')

  if (isLoading) {
    return (
      <AppNavbarProvider role="admin" user={sidebarUser}>
        <LottieOverlay visible={isLoading} />
      </AppNavbarProvider>
    )
  }

  if (!courseUid || !courseDetail.data) {
    return (
      <AppNavbarProvider role="admin" user={sidebarUser}>
        <NotFoundContent />
      </AppNavbarProvider>
    )
  }

  return (
    <AppNavbarProvider
      role="admin"
      user={sidebarUser}
      contentClassName="flex w-full flex-1 flex-col gap-6 px-4 py-4 sm:px-6 lg:px-8">
      <AdminCourseEditContent
        courseData={courseDetail.data as ICourseDetailItem}
        modules={modules}
        initialModuleId={moduleId}
      />
    </AppNavbarProvider>
  )
}

type AdminCourseEditContentProps = {
  courseData: ICourseDetailItem
  modules: ReturnType<typeof useCourseEditModules>['modules']
  initialModuleId?: string
}

function AdminCourseEditContent({ courseData, modules, initialModuleId }: AdminCourseEditContentProps) {
  const view = useCourseEditController({
    initialModuleId,
    routeBasePath: '/admin',
    role: 'admin',
    courseData,
    modules,
  })

  return <CourseEditClient view={view} isAdmin />
}

export default CourseEdit
