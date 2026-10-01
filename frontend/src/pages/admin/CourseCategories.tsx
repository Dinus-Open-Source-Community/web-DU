import { AppSidebarProvider } from '@/components/shared/Sidebar'
import { CourseMasterManagementPanel } from '@/components/shared/course-master/CourseMasterManagementPanel'
import { AdminPageShell } from '@/components/admin/AdminPageShell'
import { useAdminAppSidebar } from '@/hooks/use-sidebar-user'
import { appShellPageBgClassName } from '@/lib/design/app-shell-tokens'
import { appPageContentClassName } from '@/lib/layout/page-layout'
import { cn } from '@/lib/utils'

export default function AdminCourseCategoriesPage() {
  const { role: shellRole, user: sidebarUser } = useAdminAppSidebar()

  return (
    <AppSidebarProvider
      role={shellRole}
      user={sidebarUser}
      contentClassName={cn(appPageContentClassName, appShellPageBgClassName, 'relative')}
    >
      <AdminPageShell>
        <CourseMasterManagementPanel kind="category" />
      </AdminPageShell>
    </AppSidebarProvider>
  )
}
