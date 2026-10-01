import { useParams } from 'react-router-dom'

import { CourseAssignmentRosterView } from '@/components/shared/course-detail-manage/CourseAssignmentRosterView'
import { MentorAppPageShell } from '@/components/mentor/MentorAppPageShell'
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
      <MentorAppPageShell user={sidebarUser}>
        <PageSkeleton message="Memuat pengumpulan tugas" />
      </MentorAppPageShell>
    )
  }

  if (!courseUid || !lessonUid || !courseDetail.data) {
    return (
      <MentorAppPageShell user={sidebarUser}>
        <NotFoundContent
          description="Halaman pengumpulan tugas tidak ditemukan"
          showBackButton={false}
          title="Data tidak ditemukan"
        />
      </MentorAppPageShell>
    )
  }

  return (
    <MentorAppPageShell user={sidebarUser}>
      <MentorAssignmentSubmissionsContent
        courseUid={courseUid}
        lessonUid={lessonUid}
        courseTitle={courseDetail.data.title}
        modules={(moduleCourse.data?.modules as IModulesData[]) ?? []}
        students={userCourse.data?.enrollments ?? []}
      />
    </MentorAppPageShell>
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
