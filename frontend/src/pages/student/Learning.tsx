import { useMemo } from 'react'

import { AppSidebarProvider } from '@/components/shared/Sidebar'
import LearningSection from '@/components/student/LearningSection'
import { useResolvedProfileJoinedCourses } from '@/hooks/files/use-resolved-profile-joined-courses'
import { useSidebarUser } from '@/hooks/use-sidebar-user'
import type { IUserData } from '@/lib/types/user'
import { useAuth } from '@/providers/auth-provider'

const Learning = () => {
  const { profile } = useAuth()
  const sidebarUser = useSidebarUser('student')
  const { courses: joinedCourses } = useResolvedProfileJoinedCourses(profile?.joined_courses)

  const profileWithResolvedCourses = useMemo<IUserData | null>(() => {
    if (!profile) return null
    return {
      ...profile,
      joined_courses: joinedCourses ?? profile.joined_courses,
    }
  }, [joinedCourses, profile])

  if (!profileWithResolvedCourses) return null

  return (
    <AppSidebarProvider role="student" user={sidebarUser}>
      <LearningSection Data={profileWithResolvedCourses} />
    </AppSidebarProvider>
  )
}

export default Learning
