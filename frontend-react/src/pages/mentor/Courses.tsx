import { AppSidebarProvider } from '@/components/shared/Sidebar'
import { DashboardError } from '@/components/Admin/Dashboard/DashboardError'
import { LottieOverlay } from '@/components/shared/Loader'
import ManageCourseSection from '../../components/shared/ManageCourse'
import { useMentorCourses } from '@/hooks/mentor-courses/use-mentor-courses'
import { useSidebarUser } from '@/hooks/use-sidebar-user'

export default function MentorCoursesPage() {
  const sidebarUser = useSidebarUser('mentor')
  const { courses, error, isError, isLoading, refetch } = useMentorCourses()

  if (isLoading) {
    return <LottieOverlay visible message="Memuat kursus mentor..." />
  }

  return (
    <AppSidebarProvider role="mentor" user={sidebarUser}>
      {isError ? (
        <DashboardError
          message={error?.message ?? 'Terjadi kesalahan saat memuat kursus mentor'}
          onRetry={() => void refetch()}
        />
      ) : (
        <ManageCourseSection role="mentor" data={courses} />
      )}
    </AppSidebarProvider>
  )
}
