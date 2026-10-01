import type { ReactNode } from 'react'

import { PageHeader } from '@/components/shared/Header'
import { PageSkeleton } from '@/components/shared/PageSkeleton'
import { AppSidebarProvider } from '@/components/shared/Sidebar'
import { useAdminAppSidebar } from '@/hooks/use-sidebar-user'
import {
  appShellGridOverlayClassName,
  appShellPageBgClassName,
} from '@/lib/design/app-shell-tokens'
import { appPageContentClassName } from '@/lib/layout/page-layout'
import { userManageLayout } from '@/lib/user-manage/layout'
import { getUserManageConfig, type UserManageKind } from '@/lib/user-manage/page-config'
import { cn } from '@/lib/utils'

type UserManagePageShellProps = {
  kind: UserManageKind
  isLoading?: boolean
  loadingMessage?: string
  children: ReactNode
}

export function UserManagePageShell({
  kind,
  isLoading = false,
  loadingMessage,
  children,
}: UserManagePageShellProps) {
  const { role: shellRole, user: sidebarUser } = useAdminAppSidebar()
  const config = getUserManageConfig(kind)

  return (
    <AppSidebarProvider
      role={shellRole}
      user={sidebarUser}
      contentClassName={cn(appPageContentClassName, appShellPageBgClassName, 'relative')}
    >
      <div aria-hidden className={appShellGridOverlayClassName} />
      <div className={userManageLayout.page}>
        <PageHeader
          className="mb-0 space-y-1.5"
          title={config.pageTitle}
          subtitle={config.pageSubtitle}
        />
        {isLoading ? (
          <PageSkeleton message={loadingMessage ?? `Memuat ${config.navLabel.toLowerCase()}...`} />
        ) : (
          children
        )}
      </div>
    </AppSidebarProvider>
  )
}
