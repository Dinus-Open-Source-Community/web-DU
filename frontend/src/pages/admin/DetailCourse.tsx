import { useParams } from 'react-router-dom'

import { DetailCourse } from '../../components/shared/DetailCourseComponents'
import { AppSidebarProvider } from '../../components/shared/Sidebar'
import { NotFoundContent } from '@/components/shared/Error'
import { PageSkeleton } from '@/components/shared/PageSkeleton'
import { useCourseDetailManageView } from '@/hooks/course-detail/use-course-detail-manage-view'
import { useRegisterCourseNavbarBreadcrumb } from '@/hooks/layout/use-register-course-navbar-breadcrumb'
import { useCourseDetailAdminAndMentor } from '@/hooks/use-course'
import { useAdminAppSidebar } from '@/hooks/use-sidebar-user'
import type { IModulesData, IMentorCourseStudent } from '@/lib/types/course'

export default function AdminCourseDetailPage() {
  const { courseUid } = useParams()
  const { role: shellRole, user: sidebarUser } = useAdminAppSidebar()
  const { courseDetail, isLoading, userCourse, moduleCourse } = useCourseDetailAdminAndMentor(
    courseUid as string,
  )

  if (isLoading) {
    return <PageSkeleton message="Memuat course" />
  }

  if (!courseDetail?.data || !courseUid) {
    return (
      <NotFoundContent
        description="Detail kursus tidak ditemukan"
        showBackButton={false}
        title="Kursus tidak ditemukan"
      />
    )
  }

  return (
    <AppSidebarProvider
      role={shellRole}
      user={sidebarUser}
    >
      <AdminCourseDetailContent
        courseUid={courseUid}
        dataCourse={courseDetail.data}
        dataStudents={userCourse.data?.enrollments ?? []}
        dataModules={moduleCourse.data?.modules as IModulesData[]}
      />
    </AppSidebarProvider>
  )
}

type AdminCourseDetailContentProps = {
  courseUid: string
  dataCourse: NonNullable<ReturnType<typeof useCourseDetailAdminAndMentor>['courseDetail']['data']>
  dataStudents: IMentorCourseStudent[]
  dataModules?: IModulesData[]
}

function AdminCourseDetailContent({
  courseUid,
  dataCourse,
  dataStudents,
  dataModules,
}: AdminCourseDetailContentProps) {
  useRegisterCourseNavbarBreadcrumb(courseUid, dataCourse.title)

  const view = useCourseDetailManageView({
    courseUid,
    role: 'admin',
    dataCourse,
    dataStudents,
    dataModules,
  })

  if (!view) return null

  return <DetailCourse view={view} />
}
