'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Section from './_components/Section'
import { Sidebar } from '@/components/sidebar'
import { SidebarSessionProvider } from '@/components/sidebar/sidebar-session-context'
import { useSidebar } from '@/hooks/use-sidebar'
import { useUser } from '@/hooks/useUser'
import { toSidebarUser } from '@/lib/auth/session'
import { clearGuestSession } from '@/lib/auth/guest-session'
import { studentNavigation, mentorNavigation, adminNavigation } from '@/lib/navigation'
import { cn } from '@/lib/utils'

const Page = () => {
  const router = useRouter()
  const { isOpen, isMinimized, close, toggleMinimize } = useSidebar()
  const user = useUser()
  const [navigationModel, setNavigationModel] = useState(studentNavigation)

  useEffect(() => {
    switch (user.role) {
      case 'mentor':
        setNavigationModel(mentorNavigation)
        break
      case 'admin':
        setNavigationModel(adminNavigation)
        break
      case 'student':
      default:
        setNavigationModel(studentNavigation)
        break
    }
  }, [user.role])

  const sidebarSession = useMemo(
    () => ({
      user: toSidebarUser(user),
      onLogout: () => {
        clearGuestSession()
        router.push('/auth/login')
      },
      onProfile: () => {
        router.push('/profile')
      },
    }),
    [user, router],
  )

  return (
    <div className="min-h-screen w-full bg-[#f5f5f5]">
      <SidebarSessionProvider value={sidebarSession}>
        <Sidebar
          navigation={navigationModel}
          isOpen={isOpen}
          onClose={close}
          isMinimized={isMinimized}
          onToggleMinimize={toggleMinimize}
        />
      </SidebarSessionProvider>

      <div className={cn('flex flex-col flex-1 transition-[margin] duration-150 ease-out', isMinimized ? 'lg:ml-20' : 'lg:ml-64')}>
        <main className="flex-1 p-6">
          <Section />
        </main>
      </div>
    </div>
  )
}

export default Page
