import { useParams } from 'react-router-dom'

import { CourseAssignmentRosterView } from '@/components/shared/course-detail-manage/CourseAssignmentRosterView'
import { AppSidebarProvider } from '@/components/shared/Sidebar'
import { NotFoundContent } from '@/components/shared/Error'
import { LottieOverlay } from '@/components/shared/Loader'
import { useCourseAssignmentRosterPage } from '@/hooks/course-detail/use-course-assignment-roster-page'
import { useCourseDetailAdminAndMentor } from '@/hooks/use-course'
import { useSidebarUser } from '@/hooks/use-sidebar-user'
import type { IModulesData } from '@/lib/types/course'

export default function MentorAssignmentSubmissionsPage() {
  const { courseUid, lessonUid } = useParams()
  const sidebarUser = useSidebarUser('mentor')
  const { courseDetail, moduleCourse, userCourse, isLoading } = useCourseDetailAdminAndMentor(
    courseUid ?? '',
  )

  if (isLoading) {
    return <LottieOverlay visible={isLoading} message="Memuat pengumpulan tugas" />
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
    <AppSidebarProvider role="mentor" user={sidebarUser}>
      <MentorAssignmentSubmissionsContent
        courseUid={courseUid}
        lessonUid={lessonUid}
        courseTitle={courseDetail.data.title}
        modules={(moduleCourse.data?.modules as IModulesData[]) ?? []}
        students={userCourse.data?.enrollments ?? []}
      />
    </AppSidebarProvider>
  )
}

type MentorAssignmentSubmissionsContentProps = {
  courseUid: string
  lessonUid: string
  courseTitle: string
  modules: IModulesData[]
  students: NonNullable<
    ReturnType<typeof useCourseDetailAdminAndMentor>['userCourse']['data']
  >['enrollments']
}

function MentorAssignmentSubmissionsContent({
  courseUid,
  lessonUid,
  courseTitle,
  modules,
  students,
}: MentorAssignmentSubmissionsContentProps) {
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
