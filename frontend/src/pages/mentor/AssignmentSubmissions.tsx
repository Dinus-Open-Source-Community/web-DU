import { useParams } from 'react-router-dom'

import { CourseAssignmentRosterView } from '@/components/shared/course-detail-manage/CourseAssignmentRosterView'
import { AppSidebarProvider } from '@/components/shared/Sidebar'
import { NotFoundContent } from '@/components/shared/Error'
import { PageSkeleton } from '@/components/shared/PageSkeleton'
import { useCourseAssignmentRosterPage } from '@/hooks/course-detail/use-course-assignment-roster-page'
import { useRegisterCourseNavbarBreadcrumb } from '@/hooks/layout/use-register-course-navbar-breadcrumb'
import { useCourseDetailAdminAndMentor } from '@/hooks/use-course'
import { useSidebarUser } from '@/hooks/use-sidebar-user'
import type { IModulesData, IMentorCourseStudent } from '@/lib/types/course'

export default function MentorAssignmentSubmissionsPage() {
  const { courseUid, lessonUid } = useParams()
  const sidebarUser = useSidebarUser('mentor')
  const { courseDetail, moduleCourse, userCourse, isLoading } = useCourseDetailAdminAndMentor(
    courseUid ?? '',
  )

  if (isLoading) {
    return (
      <AppSidebarProvider
        role="mentor"
        user={sidebarUser}
      >
        <div className="relative z-[1]">
          <PageSkeleton message="Memuat pengumpulan tugas" />
        </div>
      </AppSidebarProvider>
    )
  }

  if (!courseUid || !lessonUid || !courseDetail.data) {
    return (
      <AppSidebarProvider
        role="mentor"
        user={sidebarUser}
      >
        <div className="relative z-[1]">
          <NotFoundContent
            description="Halaman pengumpulan tugas tidak ditemukan"
            showBackButton={false}
            title="Data tidak ditemukan"
          />
        </div>
      </AppSidebarProvider>
    )
  }

  return (
    <AppSidebarProvider
      role="mentor"
      user={sidebarUser}
    >
      <div className="relative z-[1]">
        <MentorAssignmentSubmissionsContent
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

type MentorAssignmentSubmissionsContentProps = {
  courseUid: string
  lessonUid: string
  courseTitle: string
  modules: IModulesData[]
  students: IMentorCourseStudent[]
}

function MentorAssignmentSubmissionsContent({
  courseUid,
  lessonUid,
  courseTitle,
  modules,
  students,
}: MentorAssignmentSubmissionsContentProps) {
  useRegisterCourseNavbarBreadcrumb(courseUid, courseTitle)

  const view = useCourseAssignmentRosterPage({
    courseUid,
    lessonUid,
    role: 'mentor',
    courseTitle,
    modules,
    students,
  })

  return <CourseAssignmentRosterView view={view} />
}
