import { MentorAppPageShell } from '@/components/mentor/MentorAppPageShell'
import { DashboardError } from '@/components/Admin/Dashboard/DashboardError'
import ManageCourseSection from '@/components/shared/ManageCourse'
import { useMentorCourses } from '@/hooks/mentor-courses/use-mentor-courses'
import { useSidebarUser } from '@/hooks/use-sidebar-user'

export default function MentorCoursesPage() {
  const sidebarUser = useSidebarUser('mentor')
  const { courses, error, isError, isLoading, refetch } = useMentorCourses()

  return (
    <MentorAppPageShell layout="content" user={sidebarUser}>
      {isError ? (
        <DashboardError
          message={error?.message ?? 'Terjadi kesalahan saat memuat kursus mentor'}
          onRetry={() => void refetch()}
        />
      ) : (
        <ManageCourseSection role="mentor" data={isLoading ? [] : courses} />
      )}
    </MentorAppPageShell>
  )
}
