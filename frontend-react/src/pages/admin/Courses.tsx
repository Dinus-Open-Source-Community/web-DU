import { AppSidebarProvider } from '../../components/shared/Sidebar'
import ManageCourseSection from '../../components/shared/ManageCourse'
import { useGetAllCourses } from '@/services/course'

const Courses = () => {
  const { data } = useGetAllCourses()
  return (
    <AppSidebarProvider role="admin" user={{ name: 'Admin', email: 'admin@doscom.id' }}>
      <ManageCourseSection role="admin" data={data?.courses || []} />
    </AppSidebarProvider>
  )
}

export default Courses
