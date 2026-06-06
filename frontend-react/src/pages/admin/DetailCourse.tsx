import { useParams } from 'react-router-dom'

import { DetailCourse } from '../../components/shared/DetailCourseComponents'
import { AppSidebarProvider } from '../../components/shared/Sidebar'
import { NotFoundContent } from '@/components/shared/Error'
import { LottieOverlay } from '@/components/shared/Loader'
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

  if (!courseDetail?.data) {
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
      <DetailCourse
        courseUid={courseUid as string}
        role="admin"
        dataCourse={courseDetail.data}
        dataStudents={userCourse.data?.enrollments ?? []}
        dataModules={moduleCourse.data?.modules as IModulesData[]}
      />
    </AppSidebarProvider>
  )
}
