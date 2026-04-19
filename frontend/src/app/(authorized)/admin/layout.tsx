'use client'

import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { adminNavigation } from '@/lib/navigation'
import { useSidebarContext } from '../layout'
import { cn } from '@/lib/utils'
import { useUser } from '@/hooks/useUser'
import { toSidebarUser } from '@/lib/data/dummyUsers'
import { clearGuestSession } from '@/lib/auth/guest-session'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = useUser()
  const router = useRouter()
  const { isOpen, close, isMinimized, toggleMinimize } = useSidebarContext()

  if (!user || user.role !== 'admin') {
    clearGuestSession()
    router.push('/auth/login')
  }

  return (
    <div className="flex min-h-screen bg-[#f5f5f5]">
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

      {/* Main content area */}
      <div className={cn('flex flex-col flex-1 transition-[margin] duration-150 ease-out', isMinimized ? 'lg:ml-20' : 'lg:ml-64')}>
        {/* Top header bar */}

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
