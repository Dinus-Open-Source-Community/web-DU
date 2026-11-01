import { useMemo } from 'react'

import { StudentAppPageShell } from '@/components/student/StudentAppPageShell'
import LearningSection from '@/components/student/LearningSection'
import { StudentLearningSkeleton } from '@/components/student/dashboard/StudentLearningSkeletons'
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

  // Selama profil belum siap, tampilkan skeleton "Kursus Saya" — bukan layar kosong.
  if (!profileWithResolvedCourses) {
    return (
      <StudentAppPageShell user={sidebarUser}>
        <StudentLearningSkeleton />
      </StudentAppPageShell>
    )
  }

  return (
    <StudentAppPageShell user={sidebarUser}>
      <LearningSection Data={profileWithResolvedCourses} />
    </StudentAppPageShell>
  )
}

export default Learning
