import { AppSidebarProvider } from '../../components/shared/Sidebar'
import ManageCourseSection from '../../components/shared/ManageCourse'
import { useCourses } from '@/hooks/use-course'
import { useSidebarUser } from '@/hooks/use-sidebar-user'

const Courses = () => {
  const { data } = useCourses()
  const sidebarUser = useSidebarUser('admin')

  return (
    <AppSidebarProvider role="admin" user={sidebarUser}>
      <ManageCourseSection role="admin" data={data?.courses || []} />
    </AppSidebarProvider>
  )
}

export default Courses
