import { AppSidebarProvider } from '@/components/shared/Sidebar'
import { PageHeader } from '@/components/shared/Header'
import { CourseMasterManagementPanel } from '@/components/shared/course-master/CourseMasterManagementPanel'
import { COURSE_MASTER_LABELS } from '@/lib/course-master/types'
import { useSidebarUser } from '@/hooks/use-sidebar-user'

export default function AdminCourseTypesPage() {
  const sidebarUser = useSidebarUser('admin')
  const labels = COURSE_MASTER_LABELS.type

  return (
    <AppSidebarProvider role="admin" user={sidebarUser}>
      <div className="flex flex-col gap-6">
        <PageHeader title={labels.pageTitle} subtitle={labels.pageSubtitle} />
        <CourseMasterManagementPanel kind="type" />
      </div>
    </AppSidebarProvider>
  )
}
