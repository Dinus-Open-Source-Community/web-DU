import type { ReactNode } from 'react'

import { AppSidebarProvider, type SidebarUser } from '@/components/shared/Sidebar'
import { useSidebarUser } from '@/hooks/use-sidebar-user'
import { mentorDashboardLayout } from '@/lib/layout/mentor-dashboard-layout'
import { cn } from '@/lib/utils'

type MentorAppPageShellProps = {
  children: ReactNode
  user?: SidebarUser
  /** `stack` = dasbor (gap antar blok); `content` = selaras halaman admin (Kursus, dll.) */
  layout?: 'stack' | 'content'
}

export function MentorAppPageShell({
  children,
  user: userProp,
  layout = 'stack',
}: MentorAppPageShellProps) {
  const defaultUser = useSidebarUser('mentor')
  const user = userProp ?? defaultUser

  return (
    <AppSidebarProvider role="mentor" user={user} contentClassName={mentorDashboardLayout.contentClassName}>
      <div aria-hidden className={mentorDashboardLayout.gridOverlay} />
      <div
        className={cn(
          layout === 'stack' ? mentorDashboardLayout.pageStack : 'relative z-[1]',
        )}
      >
        {children}
      </div>
    </AppSidebarProvider>
  )
}
