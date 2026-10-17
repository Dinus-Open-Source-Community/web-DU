import { AppSidebarProvider } from '@/components/shared/Sidebar'
import { AdminPageShell } from '@/components/admin/AdminPageShell'
import { GalleryManagementPanel } from '@/components/shared/gallery/GalleryManagementPanel'
import { useAdminAppSidebar } from '@/hooks/use-sidebar-user'
import { appShellPageBgClassName } from '@/lib/design/app-shell-tokens'
import { appPageContentClassName } from '@/lib/layout/page-layout'
import { cn } from '@/lib/utils'

export default function AdminGalleryPage() {
  const { role: shellRole, user: sidebarUser } = useAdminAppSidebar()

  return (
    <AppSidebarProvider
      role={shellRole}
      user={sidebarUser}
      contentClassName={cn(appPageContentClassName, appShellPageBgClassName, 'relative')}
    >
      <AdminPageShell>
        <GalleryManagementPanel />
      </AdminPageShell>
    </AppSidebarProvider>
  )
}
