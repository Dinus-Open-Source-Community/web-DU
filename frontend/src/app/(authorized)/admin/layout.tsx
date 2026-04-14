'use client'

import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { adminNavigation } from '@/lib/navigation'
import { useSidebarContext } from '../layout'
import { cn } from '@/lib/utils'
import { getSidebarUser } from '@/lib/auth/sidebar-user'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = getSidebarUser()
  const router = useRouter()
  const { isOpen, close, isMinimized, toggleMinimize } = useSidebarContext()

  return (
    <div className="flex min-h-screen bg-[#f5f5f5]">
      <Sidebar
        navigation={adminNavigation}
        isOpen={isOpen}
        onClose={close}
        isMinimized={isMinimized}
        onToggleMinimize={toggleMinimize}
        user={user}
        onLogout={() => {
          router.push('/auth/login')
        }}
        onProfile={() => {
          router.push('/profile')
        }}
      />

      {/* Main content area */}
      <div className={cn('flex flex-col flex-1 transition-all duration-300 ease-in-out', isMinimized ? 'lg:ml-20' : 'lg:ml-64')}>
        {/* Top header bar */}

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
