import type { ReactNode } from 'react'

import { PageHeader } from '@/components/shared/Header'
import { LottieOverlay } from '@/components/shared/Loader'
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
    <AppSidebarProvider role="admin" user={user}>
      {isLoading ? (
        <LottieOverlay visible message={loadingMessage ?? `Memuat ${config.navLabel.toLowerCase()}...`} />
      ) : null}

      <div className={userManageLayout.page}>
        <PageHeader title={config.pageTitle} subtitle={config.pageSubtitle} />
        {children}
      </div>
    </AppSidebarProvider>
  )
}
