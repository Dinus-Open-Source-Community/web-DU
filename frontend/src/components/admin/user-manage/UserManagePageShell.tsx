import type { ReactNode } from 'react'

import { PageHeader } from '@/components/shared/Header'
import { PageSkeleton } from '@/components/shared/PageSkeleton'
import { AppSidebarProvider } from '@/components/shared/Sidebar'
import { userManageLayout } from '@/lib/user-manage/layout'
import { getUserManageConfig, type UserManageKind } from '@/lib/user-manage/page-config'
import type { SidebarUser } from '@/components/shared/Sidebar'

type UserManagePageShellProps = {
  kind: UserManageKind
  user: SidebarUser
  isLoading?: boolean
  loadingMessage?: string
  children: ReactNode
}

export function UserManagePageShell({
  kind,
  user,
  isLoading = false,
  loadingMessage,
  children,
}: UserManagePageShellProps) {
  const config = getUserManageConfig(kind)

  return (
    <AppSidebarProvider role="super_admin" user={user}>
      <div className={userManageLayout.page}>
        <PageHeader title={config.pageTitle} subtitle={config.pageSubtitle} />
        {isLoading ? (
          <PageSkeleton message={loadingMessage ?? `Memuat ${config.navLabel.toLowerCase()}...`} />
        ) : (
          children
        )}
      </div>
    </AppSidebarProvider>
  )
}
