'use client'

import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { mentorNavigation } from '@/lib/navigation'
import { useSidebarContext } from '../layout'
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
  const { isOpen, isMinimized, toggleOpen, close, toggleMinimize } = useSidebarContext()

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
          router.push('/profile')
        }}
      />

      <div className={cn('flex flex-col flex-1 transition-all duration-300 ease-in-out', isMinimized ? 'lg:ml-20' : 'lg:ml-64')}>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
