import { AppSidebarProvider } from '../../components/shared/Sidebar'
import ManageCourseSection from '../../components/shared/ManageCourse'
import { useCourses } from '@/hooks/use-course'

const Courses = () => {
  const { data } = useCourses()
  return (
    <AppSidebarProvider role="admin" user={{ name: 'Admin', email: 'admin@doscom.id' }}>
      <ManageCourseSection role="admin" data={data?.courses || []} />
    </AppSidebarProvider>
  )
}

export default Courses
