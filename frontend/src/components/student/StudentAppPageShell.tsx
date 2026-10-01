import type { ReactNode } from 'react'

import { AppSidebarProvider, type SidebarUser } from '@/components/shared/Sidebar'
import { useSidebarUser } from '@/hooks/use-sidebar-user'
import { studentDashboardLayout } from '@/lib/layout/student-dashboard-layout'
import { cn } from '@/lib/utils'

type StudentAppPageShellProps = {
  children: ReactNode
  user?: SidebarUser
  layout?: 'stack' | 'content'
}

export function StudentAppPageShell({
  children,
  user: userProp,
  layout = 'stack',
}: StudentAppPageShellProps) {
  const defaultUser = useSidebarUser('student')
  const user = userProp ?? defaultUser

  return (
    <AppSidebarProvider role="student" user={user} contentClassName={studentDashboardLayout.contentClassName}>
      <div aria-hidden className={studentDashboardLayout.gridOverlay} />
      <div className={cn(layout === 'stack' ? studentDashboardLayout.pageStack : 'relative z-[1]')}>
        {children}
      </div>
    </AppSidebarProvider>
  )
}
