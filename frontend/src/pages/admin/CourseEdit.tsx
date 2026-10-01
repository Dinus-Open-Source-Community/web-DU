import { useParams, useSearchParams } from 'react-router-dom'

import type { ICourseDetailItem } from '@/lib/types/course'
import { useAdminAppSidebar } from '@/hooks/use-sidebar-user'
import { useCourseEditModules } from '@/hooks/use-course'
import { useCourseEditController } from '@/hooks/use-course-edit-controller'
import { useRegisterCourseNavbarBreadcrumb } from '@/hooks/layout/use-register-course-navbar-breadcrumb'
import { PageSkeleton } from '@/components/shared/PageSkeleton'
import { NotFoundContent } from '@/components/shared/Error'
import { CourseEditClient } from '@/components/courses/(authorized)/editCourse'
import { AppNavbarProvider } from '../../components/shared/Sidebar'
import { appPageContentClassName } from '@/lib/layout/page-layout'

const CourseEdit = () => {
  const { courseUid } = useParams()
  const [searchParams] = useSearchParams()
  const moduleId = searchParams.get('moduleId') ?? undefined

  const { role: shellRole, user: sidebarUser } = useAdminAppSidebar()
  const { courseDetail, modules, isLoading } = useCourseEditModules(courseUid ?? '')

  if (isLoading) {
    return (
      <AppNavbarProvider role={shellRole} user={sidebarUser}>
        <PageSkeleton message="Memuat course..." />
      </AppNavbarProvider>
    )
  }

  if (!courseUid || !courseDetail.data) {
    return (
      <AppNavbarProvider role={shellRole} user={sidebarUser}>
        <NotFoundContent />
      </AppNavbarProvider>
    )
  }

  return (
    <AppNavbarProvider
      role={shellRole}
      user={sidebarUser}
      contentClassName={`${appPageContentClassName} flex-1 gap-6 py-4 lg:py-6`}
    >
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
  useRegisterCourseNavbarBreadcrumb(courseData.uid, courseData.title)

  const view = useCourseEditController({
    initialModuleId,
    role: 'admin',
    courseData,
    modules,
  })

  return <CourseEditClient view={view} isAdmin />
}

export default CourseEdit
