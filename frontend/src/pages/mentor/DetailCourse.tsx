import { useParams } from 'react-router-dom'

import { DetailCourse } from '@/components/shared/DetailCourseComponents'
import { AppSidebarProvider } from '@/components/shared/Sidebar'
import { NotFoundContent } from '@/components/shared/Error'
import { PageSkeleton } from '@/components/shared/PageSkeleton'
import { useCourseDetailManageView } from '@/hooks/course-detail/use-course-detail-manage-view'
import { useRegisterCourseNavbarBreadcrumb } from '@/hooks/layout/use-register-course-navbar-breadcrumb'
import { useCourseDetailAdminAndMentor } from '@/hooks/use-course'
import { useSidebarUser } from '@/hooks/use-sidebar-user'
import type { IModulesData, IMentorCourseStudent } from '@/lib/types/course'
import { appShellPageBgClassName } from '@/lib/design/app-shell-tokens'
import { appPageContentClassName } from '@/lib/layout/page-layout'
import { cn } from '@/lib/utils'

export default function MentorCourseDetailPage() {
  const { courseUid } = useParams()
  const sidebarUser = useSidebarUser('mentor')
  const { courseDetail, isLoading, moduleCourse, userCourse } =
    useCourseDetailAdminAndMentor(courseUid ?? '')

  if (isLoading) {
    return <PageSkeleton message="Memuat course" />
  }

  if (!courseUid || !courseDetail.data) {
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
      role="mentor"
      user={sidebarUser}
      contentClassName={cn(appPageContentClassName, appShellPageBgClassName, 'relative')}
    >
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
  dataStudents: IMentorCourseStudent[]
  dataModules?: IModulesData[]
}

function MentorCourseDetailContent({
  courseUid,
  dataCourse,
  dataStudents,
  dataModules,
}: MentorCourseDetailContentProps) {
  useRegisterCourseNavbarBreadcrumb(courseUid, dataCourse.title)

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
