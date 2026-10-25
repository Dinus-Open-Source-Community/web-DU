import { useState } from 'react'
import { AppSidebarProvider } from '../../components/shared/Sidebar'
import ManageCourseSection from '../../components/shared/ManageCourse'
import { useCreateCourseActions } from '@/hooks/course-form/use-create-course-actions'
import { useCourseFormOptions } from '@/hooks/course-form/use-course-form-options'
import { useCourses } from '@/hooks/use-course'
import { useAdminAppSidebar } from '@/hooks/use-sidebar-user'

const Courses = () => {
  const { data } = useCourses()
  const { role: shellRole, user: sidebarUser } = useAdminAppSidebar()
  const [createOpen, setCreateOpen] = useState(false)
  const formOptions = useCourseFormOptions(createOpen)
  const createCourse = useCreateCourseActions()

  return (
    <AppSidebarProvider
      role={shellRole}
      user={sidebarUser}
    >
      <div className="relative z-[1]">
        <ManageCourseSection
          role="admin"
          data={data?.courses || []}
          formOptions={formOptions}
          createCourse={createCourse}
          createOpen={createOpen}
          onCreateOpenChange={setCreateOpen}
        />
      </div>
    </AppSidebarProvider>
  )
}

export default Courses
