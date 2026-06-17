import { useMemo } from 'react'

import DashboardSection from '@/components/student/DashboardSection'
import { AppSidebarProvider } from '../../components/shared/Sidebar'
import { useResolvedProfileJoinedCourses } from '@/hooks/files/use-resolved-profile-joined-courses'
import { useSidebarUser } from '@/hooks/use-sidebar-user'
import type { IUserData } from '@/lib/types/user'
import { useAuth } from '@/providers/auth-provider'

export default function StudentDashboard() {
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
      <DashboardSection Data={profileWithResolvedCourses} />
    </AppSidebarProvider>
  )
}
