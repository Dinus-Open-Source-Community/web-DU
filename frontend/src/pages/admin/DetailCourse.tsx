import { useParams } from 'react-router-dom'

import { DetailCourse } from '../../components/shared/DetailCourseComponents'
import { AppSidebarProvider } from '../../components/shared/Sidebar'
import { NotFoundContent } from '@/components/shared/Error'
import { LottieOverlay } from '@/components/shared/Loader'
import { useCourseDetailManageView } from '@/hooks/course-detail/use-course-detail-manage-view'
import { useCourseDetailAdminAndMentor } from '@/hooks/use-course'
import { useSidebarUser } from '@/hooks/use-sidebar-user'
import type { IModulesData } from '@/lib/types/course'

export default function AdminCourseDetailPage() {
  const { courseUid } = useParams()
  const sidebarUser = useSidebarUser('admin')
  const { courseDetail, isLoading, userCourse, moduleCourse } = useCourseDetailAdminAndMentor(
    courseUid as string,
  )

  if (isLoading) {
    return <LottieOverlay visible={isLoading} message="Memuat course" />
  }

  if (!courseDetail?.data || !courseUid) {
    return (
      <NotFoundContent
        description="Detail course tidak ditemukan"
        showBackButton={false}
        title="Course tidak ditemukan"
      />
    )
  }

  return (
    <AppSidebarProvider role="admin" user={sidebarUser}>
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
  dataStudents: NonNullable<ReturnType<typeof useCourseDetailAdminAndMentor>['userCourse']['data']>['enrollments']
  dataModules?: IModulesData[]
}

function AdminCourseDetailContent({
  courseUid,
  dataCourse,
  dataStudents,
  dataModules,
}: AdminCourseDetailContentProps) {
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
