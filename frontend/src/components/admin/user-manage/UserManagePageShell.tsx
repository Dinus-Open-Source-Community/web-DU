import type { ReactNode } from 'react'

import { PageSkeleton } from '@/components/shared/PageSkeleton'
import { AppSidebarProvider } from '@/components/shared/Sidebar'
import { useAdminAppSidebar } from '@/hooks/use-sidebar-user'
import {
  appPageSubtitleClassName,
  appPageTitleClassName,
} from '@/lib/design/app-shell-tokens'
import { userManageLayout } from '@/lib/user-manage/layout'
import { getUserManageConfig, type UserManageKind } from '@/lib/user-manage/page-config'

type UserManagePageShellProps = {
  kind: UserManageKind
  isLoading?: boolean
  loadingMessage?: string
  action?: ReactNode
  children: ReactNode
}

export function UserManagePageShell({
  kind,
  isLoading = false,
  loadingMessage,
  action,
  children,
}: UserManagePageShellProps) {
  const { role: shellRole, user: sidebarUser } = useAdminAppSidebar()
  const config = getUserManageConfig(kind)

  return (
    <AppSidebarProvider
      role={shellRole}
      user={sidebarUser}
    >
      <div className={userManageLayout.page}>
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className={appPageTitleClassName}>{config.pageTitle}</h1>
            {action ? <div className="shrink-0">{action}</div> : null}
          </div>
          {config.pageSubtitle ? (
            <p className={appPageSubtitleClassName}>{config.pageSubtitle}</p>
          ) : null}
        </div>

        {isLoading ? (
          <PageSkeleton message={loadingMessage ?? `Memuat ${config.navLabel.toLowerCase()}...`} />
        ) : (
          children
        )}
      </div>
    </AppSidebarProvider>
  )
}
