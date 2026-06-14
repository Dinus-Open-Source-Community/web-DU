import { AppSidebarProvider } from '../../components/shared/Sidebar'
import ManageCourseSection from '../../components/shared/ManageCourse'
import { useCreateCourseActions } from '@/hooks/course-form/use-create-course-actions'
import { useCourseFormOptions } from '@/hooks/course-form/use-course-form-options'
import { useCourses } from '@/hooks/use-course'
import { useSidebarUser } from '@/hooks/use-sidebar-user'

const Courses = () => {
  const { data } = useCourses()
  const sidebarUser = useSidebarUser('admin')
  const formOptions = useCourseFormOptions()
  const createCourse = useCreateCourseActions({ roleBasePath: '/admin' })

  return (
    <AppSidebarProvider role="admin" user={sidebarUser}>
      <ManageCourseSection
        role="admin"
        data={data?.courses || []}
        formOptions={formOptions}
        createCourse={createCourse}
      />
    </AppSidebarProvider>
  )
}

export default Courses
