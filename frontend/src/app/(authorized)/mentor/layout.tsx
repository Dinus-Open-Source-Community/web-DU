'use client'

import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { mentorNavigation } from '@/lib/navigation'
import { useSidebar } from '@/hooks/use-sidebar'
import { Menu } from 'lucide-react'
import { cn } from '@/lib/utils'

// TODO: Replace with actual user data from JWT/auth context
const mockUser = {
  name: 'Mentor User',
  email: 'mentor@doscom.org',
  role: 'Mentor',
  avatar: '',
}

export default function MentorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isOpen, isMinimized, toggleOpen, close, toggleMinimize } = useSidebar()

  return (
    <div className="flex min-h-screen bg-[#f5f5f5]">
      <Sidebar
        navigation={mentorNavigation}
        isOpen={isOpen}
        onClose={close}
        isMinimized={isMinimized}
        onToggleMinimize={toggleMinimize}
        user={mockUser}
        onLogout={() => {
          console.log('Logout clicked')
          router.push('/auth/login')
        }}
        onProfile={() => {
          router.push('/mentor/profile')
        }}
      />

      <div
        className={cn(
          'flex flex-col flex-1 transition-all duration-300 ease-in-out',
          isMinimized ? 'lg:ml-20' : 'lg:ml-64',
        )}
      >
        <header className="sticky top-0 z-20 flex items-center justify-between bg-white px-6 py-4 shadow-sm border-b border-slate-100 lg:px-8">
          <button
            onClick={toggleOpen}
            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#0a84dc] flex items-center justify-center text-white text-sm font-bold">
              {mockUser.name.charAt(0)}
            </div>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
