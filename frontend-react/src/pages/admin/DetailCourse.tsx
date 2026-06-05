import { useParams } from 'react-router-dom'
import { DetailCourse } from '../../components/shared/DetailCourseComponents'
import { AppSidebarProvider } from '../../components/shared/Sidebar'
import { useAuth } from '@/providers/auth-provider'
import type { IUserData } from '@/lib/types/user'
import { useGetCourseDetailAdminAndMentor } from '@/services/course'
import { NotFoundContent } from '@/components/shared/Error'
import { LottieOverlay } from '@/components/shared/Loader'
import type { IModulesData } from '@/lib/types/course'

export default function AdminCourseDetailPage() {
  const { courseUid } = useParams()
  const { user } = useAuth()
  const { courseDetail, isLoading, userCourse, moduleCourse } = useGetCourseDetailAdminAndMentor(courseUid as string)

  if (!courseDetail?.data) return <NotFoundContent description="Detail course tidak di temukan" showBackButton={false} title="Course Tidak ditemukan" />
  if (isLoading) return <LottieOverlay visible={isLoading} message="Memuat Course" />

  return (
    <AppSidebarProvider role="admin" user={user as IUserData}>
      <DetailCourse
        courseUid={courseUid as string}
        role="admin"
        dataCourse={courseDetail.data ?? null}
        dataStudents={userCourse.data?.enrollments ?? []}
        dataModules={moduleCourse.data?.modules as IModulesData[]}
      />
    </AppSidebarProvider>
  )
}
