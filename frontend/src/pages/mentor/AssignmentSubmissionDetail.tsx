import { useParams } from 'react-router-dom'

import { CourseAssignmentSubmissionDetailView } from '@/components/shared/course-detail-manage/CourseAssignmentSubmissionDetailView'
import { AppNavbarProvider } from '@/components/shared/Sidebar'
import { NotFoundContent } from '@/components/shared/Error'
import { LottieOverlay } from '@/components/shared/Loader'
import { useCourseAssignmentSubmissionDetailPage } from '@/hooks/course-detail/use-course-assignment-submission-detail-page'
import { useCourseDetailAdminAndMentor } from '@/hooks/use-course'
import { useSidebarUser } from '@/hooks/use-sidebar-user'
import type { IModulesData } from '@/lib/types/course'

export default function MentorAssignmentSubmissionDetailPage() {
  const { courseUid, lessonUid, submissionUid } = useParams()
  const sidebarUser = useSidebarUser('mentor')
  const { courseDetail, moduleCourse, userCourse, isLoading } = useCourseDetailAdminAndMentor(
    courseUid ?? '',
  )

  if (isLoading) {
    return (
      <AppNavbarProvider role="mentor" user={sidebarUser}>
        <LottieOverlay visible={isLoading} message="Memuat jawaban siswa" />
      </AppNavbarProvider>
    )
  }

  if (!courseUid || !lessonUid || !submissionUid || !courseDetail.data) {
    return (
      <AppNavbarProvider role="mentor" user={sidebarUser}>
        <NotFoundContent
          description="Halaman jawaban siswa tidak ditemukan"
          showBackButton={false}
          title="Data tidak ditemukan"
        />
      </AppNavbarProvider>
    )
  }

  return (
    <AppNavbarProvider
      role="mentor"
      user={sidebarUser}
      contentClassName="flex min-h-0 w-full flex-1 flex-col gap-0 p-0"
    >
      <MentorAssignmentSubmissionDetailContent
        courseUid={courseUid}
        lessonUid={lessonUid}
        submissionUid={submissionUid}
        courseTitle={courseDetail.data.title}
        modules={(moduleCourse.data?.modules as IModulesData[]) ?? []}
        students={userCourse.data?.enrollments ?? []}
      />
    </AppNavbarProvider>
  )
}

type MentorAssignmentSubmissionDetailContentProps = {
  courseUid: string
  lessonUid: string
  submissionUid: string
  courseTitle: string
  modules: IModulesData[]
  students: NonNullable<
    ReturnType<typeof useCourseDetailAdminAndMentor>['userCourse']['data']
  >['enrollments']
}

function MentorAssignmentSubmissionDetailContent({
  courseUid,
  lessonUid,
  submissionUid,
  courseTitle,
  modules,
  students,
}: MentorAssignmentSubmissionDetailContentProps) {
  const view = useCourseAssignmentSubmissionDetailPage({
    courseUid,
    lessonUid,
    submissionUid,
    role: 'mentor',
    courseTitle,
    modules,
    students,
  })

  return <CourseAssignmentSubmissionDetailView view={view} />
}
