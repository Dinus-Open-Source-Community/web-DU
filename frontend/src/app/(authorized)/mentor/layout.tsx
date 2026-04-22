'use client'

import { useCallback, useMemo } from 'react'
import Link from 'next/link'
import { Home } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { SidebarSessionProvider } from '@/components/sidebar/sidebar-session-context'
import { useSidebarState } from '@/components/sidebar/sidebar-state-provider'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { mentorNavigation } from '@/lib/navigation'
import { buildSidebarBreadcrumbs, shouldHideSidebarForPath } from '@/lib/sidebar-route'
import { cn } from '@/lib/utils'
import { useUser } from '@/hooks/useUser'
import { toSidebarUser } from '@/lib/data/dummyUsers'
import { clearGuestSession } from '@/lib/auth/guest-session'

export default function MentorLayout({ children }: { children: React.ReactNode }) {
  const user = useUser()
  const pathname = usePathname()
  const router = useRouter()
  const { isOpen, isMinimized, close, toggleMinimize } = useSidebarState()
  const hideSidebar = shouldHideSidebarForPath(pathname, mentorNavigation, 'mentor')
  const breadcrumbs = hideSidebar ? buildSidebarBreadcrumbs(pathname, mentorNavigation, 'mentor') : []

  const handleLogout = useCallback(() => {
    clearGuestSession()
    router.push('/auth/login')
  }, [router])

  const handleProfile = useCallback(() => {
    router.push('/profile')
  }, [router])

  const sidebarSession = useMemo(
    () => ({
      user: toSidebarUser(user),
      onLogout: handleLogout,
      onProfile: handleProfile,
    }),
    [user, handleLogout, handleProfile],
  )

  return (
    <div className="flex min-h-screen bg-[#f5f5f5]">
      {!hideSidebar && (
        <SidebarSessionProvider value={sidebarSession}>
          <Sidebar navigation={mentorNavigation} isOpen={isOpen} onClose={close} isMinimized={isMinimized} onToggleMinimize={toggleMinimize} />
        </SidebarSessionProvider>
      )}

      <div className={cn('flex flex-1 flex-col transition-[margin] duration-150 ease-out', !hideSidebar && (isMinimized ? 'lg:ml-20' : 'lg:ml-64'))}>
        {hideSidebar && breadcrumbs.length > 0 && (
          <div className="px-4 pt-4 sm:px-6 lg:px-8 lg:pt-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/mentor/dashboard" className="inline-flex items-center gap-1">
                      <Home className="size-3.5" />
                      Home
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {breadcrumbs.map((crumb) => (
                  <BreadcrumbItem key={`${crumb.label}-${crumb.href ?? 'current'}`}>
                    <BreadcrumbSeparator />
                    {crumb.href ? (
                      <BreadcrumbLink asChild>
                        <Link href={crumb.href}>{crumb.label}</Link>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        )}

        <main className={cn('flex-1', hideSidebar ? 'p-4 sm:p-6 lg:p-8' : 'p-6')}>{children}</main>
      </div>
    </div>
  )
}
