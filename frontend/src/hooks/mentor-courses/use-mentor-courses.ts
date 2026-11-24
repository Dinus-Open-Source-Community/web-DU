import { useAuth } from '@/providers/auth-provider'
import { useAdminCourses } from '@/hooks/use-course'

export function useMentorCourses() {
  const { profile, isLoading: isProfileLoading } = useAuth()
  const mentorUid = profile?.uid ?? ''
  // Staff endpoint: mentor automatically scoped to assigned courses (incl. DRAFT).
  const coursesQuery = useAdminCourses(
    { mentor_id: mentorUid },
    { enabled: Boolean(mentorUid) },
  )

  return {
    courses: coursesQuery.data?.courses ?? [],
    error: coursesQuery.error,
    isError: coursesQuery.isError,
    isLoading: isProfileLoading || coursesQuery.isLoading,
    refetch: coursesQuery.refetch,
  }
}
