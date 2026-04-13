'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Section from './_components/Section'
import { Sidebar } from '@/components/sidebar'
import { useSidebar } from '@/hooks/use-sidebar'
import { studentNavigation, mentorNavigation, adminNavigation } from '@/lib/navigation'
import { cn } from '@/lib/utils'

// TODO: Replace with actual user data from JWT/auth context
const mockUser = {
  name: 'Zapp',
  email: 'saptogusty@gmail.com',
  role: 'Student', // Ubah ini ke 'Mentor' atau 'Admin' untuk ngetes dinamis
  avatar: 'https://i.pravatar.cc/150?img=11',
}

const Page = () => {
  const router = useRouter()
  const { isOpen, isMinimized, close, toggleMinimize } = useSidebar()
  const [navigationModel, setNavigationModel] = useState(studentNavigation)

  // Dynamically switch navigation UI depending on the role
  useEffect(() => {
    switch (mockUser.role.toLowerCase()) {
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
  }, [mockUser.role])

  return (
    <div className="min-h-screen w-full bg-[#f5f5f5]">
      <Sidebar
        navigation={navigationModel}
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
        <main className="flex-1 p-6">
          <Section />
        </main>
      </div>
    </div>
  )
}

export default Page

