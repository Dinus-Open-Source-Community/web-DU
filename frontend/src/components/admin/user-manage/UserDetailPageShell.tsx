import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

import { PageSkeleton } from '@/components/shared/PageSkeleton'
import { AppSidebarProvider } from '@/components/shared/Sidebar'
import { useAdminAppSidebar } from '@/hooks/use-sidebar-user'
import { userManageLayout } from '@/lib/user-manage/layout'
import type { UserManageKind } from '@/lib/user-manage/page-config'
import { getUserManageConfig } from '@/lib/user-manage/page-config'

type UserDetailPageShellProps = {
  kind: UserManageKind
  backHref: string
  isLoading?: boolean
  loadingMessage?: string
  children?: ReactNode
}

export function UserDetailPageShell({
  kind,
  backHref,
  isLoading = false,
  loadingMessage,
  children,
}: UserDetailPageShellProps) {
  const { role: shellRole, user: sidebarUser } = useAdminAppSidebar()
  const config = getUserManageConfig(kind)

  return (
    <AppSidebarProvider
      role={shellRole}
      user={sidebarUser}
    >
      <div className={userManageLayout.page}>
        <div className="flex flex-col gap-4">
          <Link to={backHref} className={userManageLayout.backLink}>
            <ArrowLeft className="size-4 shrink-0" aria-hidden />
            <span>Kembali ke {config.navLabel.toLowerCase()}</span>
          </Link>
          {isLoading ? (
            <PageSkeleton message={loadingMessage ?? 'Memuat detail user...'} />
          ) : (
            children
          )}
        </div>
      </div>
    </AppSidebarProvider>
  )
}
