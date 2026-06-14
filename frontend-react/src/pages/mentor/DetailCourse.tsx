import { useParams } from 'react-router-dom'

import { DetailCourse } from '@/components/shared/DetailCourseComponents'
import { NotFoundContent } from '@/components/shared/Error'
import { LottieOverlay } from '@/components/shared/Loader'
import { AppSidebarProvider } from '@/components/shared/Sidebar'
import { useCourseDetailManageView } from '@/hooks/course-detail/use-course-detail-manage-view'
import { useCourseDetailAdminAndMentor } from '@/hooks/use-course'
import { useSidebarUser } from '@/hooks/use-sidebar-user'
import type { IModulesData } from '@/lib/types/course'

export default function MentorCourseDetailPage() {
  const { courseUid } = useParams()
  const sidebarUser = useSidebarUser('mentor')
  const { courseDetail, isLoading, moduleCourse, userCourse } =
    useCourseDetailAdminAndMentor(courseUid ?? '')

  if (isLoading) {
    return <LottieOverlay visible message="Memuat course..." />
  }

  if (!courseUid || !courseDetail.data) {
    return (
      <NotFoundContent
        description="Detail course tidak ditemukan"
        showBackButton={false}
        title="Course tidak ditemukan"
      />
    )
  }

  return (
    <AppSidebarProvider role="mentor" user={sidebarUser}>
      <MentorCourseDetailContent
        courseUid={courseUid}
        dataCourse={courseDetail.data}
        dataStudents={userCourse.data?.enrollments ?? []}
        dataModules={moduleCourse.data?.modules as IModulesData[]}
      />
    </AppSidebarProvider>
  )
}

type MentorCourseDetailContentProps = {
  courseUid: string
  dataCourse: NonNullable<
    ReturnType<typeof useCourseDetailAdminAndMentor>['courseDetail']['data']
  >
  dataStudents: NonNullable<
    ReturnType<typeof useCourseDetailAdminAndMentor>['userCourse']['data']
  >['enrollments']
  dataModules?: IModulesData[]
}

function MentorCourseDetailContent({
  courseUid,
  dataCourse,
  dataStudents,
  dataModules,
}: MentorCourseDetailContentProps) {
  const view = useCourseDetailManageView({
    courseUid,
    role: 'mentor',
    dataCourse,
    dataStudents,
    dataModules,
  })

  if (!view) return null

  return <DetailCourse view={view} />
}
