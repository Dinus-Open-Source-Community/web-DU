import { AppSidebarProvider } from '../../components/shared/Sidebar'
import ManageCourseSection from '../../components/shared/ManageCourse'
import { useCreateCourseActions } from '@/hooks/course-form/use-create-course-actions'
import { useCourseFormOptions } from '@/hooks/course-form/use-course-form-options'
import { useCourses } from '@/hooks/use-course'
import { useAdminAppSidebar } from '@/hooks/use-sidebar-user'
import {
  appShellGridOverlayClassName,
  appShellPageBgClassName,
} from '@/lib/design/app-shell-tokens'
import { appPageContentClassName } from '@/lib/layout/page-layout'
import { cn } from '@/lib/utils'

const Courses = () => {
  const { data } = useCourses()
  const { role: shellRole, user: sidebarUser } = useAdminAppSidebar()
  const formOptions = useCourseFormOptions()
  const createCourse = useCreateCourseActions()

  return (
    <AppSidebarProvider
      role={shellRole}
      user={sidebarUser}
      contentClassName={cn(appPageContentClassName, appShellPageBgClassName, 'relative')}
    >
      <div aria-hidden className={appShellGridOverlayClassName} />
      <div className="relative z-[1]">
        <ManageCourseSection
          role="admin"
          data={data?.courses || []}
          formOptions={formOptions}
          createCourse={createCourse}
        />
      </div>
    </AppSidebarProvider>
  )
}

export default Courses
