'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { mentorNavigation } from '@/lib/navigation'
import { useSidebarContext } from '../layout'
import { cn } from '@/lib/utils'

// TODO: Replace with actual user data from JWT/auth context
const mockUser = {
  name: 'Mentor User',
  email: 'mentor@doscom.org',
  role: 'Mentor',
  avatar: '',
}

/** Preview/detail kursus atau absensi per kursus: layar tanpa sidebar */
function isMentorCourseDetailRoute(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length !== 3 || segments[0] !== 'mentor') return false
  if (segments[1] === 'courses' && segments[2] !== 'create') return true
  if (segments[1] === 'attendeance') return true
  return false
}

export default function MentorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { isOpen, isMinimized, close, toggleMinimize } = useSidebarContext()
  const hideSidebar = isMentorCourseDetailRoute(pathname)

  return (
    <div className="flex min-h-screen bg-[#f5f5f5]">
      {!hideSidebar && (
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
      )}

      <div
        className={cn(
          'flex flex-1 flex-col transition-all duration-300 ease-in-out',
          !hideSidebar && (isMinimized ? 'lg:ml-20' : 'lg:ml-64')
        )}>
        <main className={cn('flex-1', hideSidebar ? 'p-4 sm:p-6 lg:p-8' : 'p-6')}>{children}</main>
      </div>
    </div>
  )
}
