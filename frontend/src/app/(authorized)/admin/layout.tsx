'use client'

import Link from 'next/link'
import { Home } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { adminNavigation } from '@/lib/navigation'
import { buildSidebarBreadcrumbs, shouldHideSidebarForPath } from '@/lib/sidebar-route'
import { useSidebarContext } from '../layout'
import { cn } from '@/lib/utils'
import { useUser } from '@/hooks/useUser'
import { toSidebarUser } from '@/lib/data/dummyUsers'
import { clearGuestSession } from '@/lib/auth/guest-session'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = useUser()
  const pathname = usePathname()
  const router = useRouter()
  const { isOpen, close, isMinimized, toggleMinimize } = useSidebarContext()
  const hideSidebar = shouldHideSidebarForPath(pathname, adminNavigation, 'admin')
  const breadcrumbs = hideSidebar ? buildSidebarBreadcrumbs(pathname, adminNavigation, 'admin') : []

  useEffect(() => {
    if (!isAdmin) {
      clearGuestSession()
      router.replace('/auth/login')
    }
  }, [isAdmin, router])

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5]">
        <p className="text-sm text-muted-foreground">Mengalihkan ke halaman masuk…</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#f5f5f5]">
      {!hideSidebar && (
        <Sidebar
          navigation={adminNavigation}
          isOpen={isOpen}
          onClose={close}
          isMinimized={isMinimized}
          onToggleMinimize={toggleMinimize}
          user={toSidebarUser(user)}
          onLogout={() => {
            clearGuestSession()
            router.push('/auth/login')
          }}
          onProfile={() => {
            router.push('/profile')
          }}
        />
      )}

      <div className={cn('flex flex-col flex-1 transition-[margin] duration-150 ease-out', !hideSidebar && (isMinimized ? 'lg:ml-20' : 'lg:ml-64'))}>
        {hideSidebar && breadcrumbs.length > 0 && (
          <div className="px-4 pt-4 sm:px-6 lg:px-8 lg:pt-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/admin/dashboard" className="inline-flex items-center gap-1">
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
