'use client'

import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { adminNavigation } from '@/lib/navigation'
import { useSidebar } from '@/hooks/use-sidebar'
import { Menu } from 'lucide-react'
import { cn } from '@/lib/utils'

// TODO: Replace with actual user data from JWT/auth context
const mockUser = {
  name: 'Admin User',
  email: 'admin@doscom.org',
  role: 'Administrator',
  avatar: '',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isOpen, isMinimized, toggleOpen, close, toggleMinimize } = useSidebar()

  return (
    <div className="flex min-h-screen bg-[#f5f5f5]">
      <Sidebar
        navigation={adminNavigation}
        isOpen={isOpen}
        onClose={close}
        isMinimized={isMinimized}
        onToggleMinimize={toggleMinimize}
        user={mockUser}
        onLogout={() => {
          // TODO: Call logout API, clear JWT, redirect
          console.log('Logout clicked')
          router.push('/auth/login')
        }}
        onProfile={() => {
          router.push('/admin/profile')
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
