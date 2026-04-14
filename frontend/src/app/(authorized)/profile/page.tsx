'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Section from './_components/Section'
import { Sidebar } from '@/components/sidebar'
import { useSidebar } from '@/hooks/use-sidebar'
import { studentNavigation, mentorNavigation, adminNavigation } from '@/lib/navigation'
import { cn } from '@/lib/utils'
import { getSidebarUser } from '@/lib/auth/sidebar-user'

const Page = () => {
  const router = useRouter()
  const { isOpen, isMinimized, close, toggleMinimize } = useSidebar()
  const session = useMemo(() => getSidebarUser(), [])
  const [navigationModel, setNavigationModel] = useState(studentNavigation)

  useEffect(() => {
    switch (session.role.toLowerCase()) {
      case 'mentor':
        setNavigationModel(mentorNavigation)
        break
      case 'admin':
      case 'administrator':
        setNavigationModel(adminNavigation)
        break
      case 'student':
      default:
        setNavigationModel(studentNavigation)
        break
    }
  }, [session.role])

  return (
    <div className="min-h-screen w-full bg-[#f5f5f5]">
      <Sidebar
        navigation={navigationModel}
        isOpen={isOpen}
        onClose={close}
        isMinimized={isMinimized}
        onToggleMinimize={toggleMinimize}
        user={session}
        onLogout={() => {
          router.push('/auth/login')
        }}
        onProfile={() => {
          router.push('/profile')
        }}
      />

      <div className={cn('flex flex-col flex-1 transition-all duration-300 ease-in-out', isMinimized ? 'lg:ml-20' : 'lg:ml-64')}>
        <main className="flex-1 p-6">
          <Section />
        </main>
      </div>
    </div>
  )
}

export default Page
