import { AppSidebarProvider } from '@/components/shared/Sidebar'
import { CourseMasterManagementPanel } from '@/components/shared/course-master/CourseMasterManagementPanel'
import { AdminPageShell } from '@/components/admin/AdminPageShell'
import { useAdminAppSidebar } from '@/hooks/use-sidebar-user'

export default function AdminCourseCategoriesPage() {
  const { role: shellRole, user: sidebarUser } = useAdminAppSidebar()

  return (
    <AppSidebarProvider
      role={shellRole}
      user={sidebarUser}
    >
      <AdminPageShell>
        <CourseMasterManagementPanel kind="category" />
      </AdminPageShell>
    </AppSidebarProvider>
  )
}
