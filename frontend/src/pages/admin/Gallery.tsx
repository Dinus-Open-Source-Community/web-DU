import { AppSidebarProvider } from '@/components/shared/Sidebar'
import { AdminPageShell } from '@/components/admin/AdminPageShell'
import { GalleryManagementPanel } from '@/components/shared/gallery/GalleryManagementPanel'
import { useAdminAppSidebar } from '@/hooks/use-sidebar-user'

export default function AdminGalleryPage() {
  const { role: shellRole, user: sidebarUser } = useAdminAppSidebar()

  return (
    <AppSidebarProvider
      role={shellRole}
      user={sidebarUser}
      contentClassName="mx-auto flex w-full min-w-0 flex-col gap-5 px-4 pt-5 pb-4 sm:gap-6 sm:px-5 sm:pt-6 sm:pb-5 md:px-6 md:pt-7 md:pb-6 lg:px-8 lg:pt-8 lg:pb-6"
    >
      <AdminPageShell className="gap-5">
        <GalleryManagementPanel />
      </AdminPageShell>
    </AppSidebarProvider>
  )
}
