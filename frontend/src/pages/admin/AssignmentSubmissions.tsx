import { useParams } from 'react-router-dom'

import { CourseAssignmentRosterView } from '@/components/shared/course-detail-manage/CourseAssignmentRosterView'
import { AppSidebarProvider } from '@/components/shared/Sidebar'
import { NotFoundContent } from '@/components/shared/Error'
import { PageSkeleton } from '@/components/shared/PageSkeleton'
import { useCourseAssignmentRosterPage } from '@/hooks/course-detail/use-course-assignment-roster-page'
import { useRegisterCourseNavbarBreadcrumb } from '@/hooks/layout/use-register-course-navbar-breadcrumb'
import { useCourseDetailAdminAndMentor } from '@/hooks/use-course'
import { useAdminAppSidebar } from '@/hooks/use-sidebar-user'
import { appShellGridOverlayClassName, appShellPageBgClassName } from '@/lib/design/app-shell-tokens'
import { appPageContentClassName } from '@/lib/layout/page-layout'
import { cn } from '@/lib/utils'
import type { IModulesData, IMentorCourseStudent } from '@/lib/types/course'

export default function AdminAssignmentSubmissionsPage() {
  const { courseUid, lessonUid } = useParams()
  const { role: shellRole, user: sidebarUser } = useAdminAppSidebar()
  const { courseDetail, moduleCourse, userCourse, isLoading } = useCourseDetailAdminAndMentor(
    courseUid ?? '',
  )

  if (isLoading) {
    return <PageSkeleton message="Memuat pengumpulan tugas" />
  }

  if (!courseUid || !lessonUid || !courseDetail.data) {
    return (
      <NotFoundContent
        description="Halaman pengumpulan tugas tidak ditemukan"
        showBackButton={false}
        title="Data tidak ditemukan"
      />
    )
  }

  return (
    <AppSidebarProvider
      role={shellRole}
      user={sidebarUser}
      contentClassName={cn(appPageContentClassName, appShellPageBgClassName, 'relative')}
    >
      <div aria-hidden className={appShellGridOverlayClassName} />
      <div className="relative z-[1]">
        <AdminAssignmentSubmissionsContent
          courseUid={courseUid}
          lessonUid={lessonUid}
          courseTitle={courseDetail.data.title}
          modules={(moduleCourse.data?.modules as IModulesData[]) ?? []}
          students={userCourse.data?.enrollments ?? []}
        />
      </div>
    </AppSidebarProvider>
  )
}

type AdminAssignmentSubmissionsContentProps = {
  courseUid: string
  lessonUid: string
  courseTitle: string
  modules: IModulesData[]
  students: IMentorCourseStudent[]
}

function AdminAssignmentSubmissionsContent({
  courseUid,
  lessonUid,
  courseTitle,
  modules,
  students,
}: AdminAssignmentSubmissionsContentProps) {
  useRegisterCourseNavbarBreadcrumb(courseUid, courseTitle)

  const view = useCourseAssignmentRosterPage({
    courseUid,
    lessonUid,
    role: 'admin',
    courseTitle,
    modules,
    students,
  })

  return <CourseAssignmentRosterView view={view} />
}
