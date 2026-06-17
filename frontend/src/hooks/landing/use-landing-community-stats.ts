import { useMemo } from 'react'

import { useCourses } from '@/hooks/use-course'

export type LandingCommunityStat = {
  id: string
  label: string
  value: string
}

function formatCompactCount(value: number) {
  return new Intl.NumberFormat('id-ID', {
    notation: value >= 10_000 ? 'compact' : 'standard',
    maximumFractionDigits: value >= 10_000 ? 1 : 0,
  }).format(value)
}

export function useLandingCommunityStats() {
  const query = useCourses({
    per_page: 100,
    status: 'ACTIVE',
    sort_by: 'created_at',
    sort_order: 'desc',
  })

  const stats = useMemo<LandingCommunityStat[]>(() => {
    const courses = query.data?.courses ?? []
    const activeCourses = query.data?.meta?.total ?? courses.length
    const totalReviews = courses.reduce((sum, course) => sum + (course.total_reviews ?? 0), 0)
    const mentorUids = new Set<string>()

    for (const course of courses) {
      for (const mentor of course.mentors ?? []) {
        if (mentor.uid) mentorUids.add(mentor.uid)
      }
    }

    return [
      { id: 'courses', label: 'Kursus aktif', value: formatCompactCount(activeCourses) },
      { id: 'reviews', label: 'Total ulasan', value: formatCompactCount(totalReviews) },
      { id: 'mentors', label: 'Mentor terdaftar', value: formatCompactCount(mentorUids.size) },
    ]
  }, [query.data?.courses, query.data?.meta?.total])

  return {
    stats,
    isLoading: query.isLoading,
  }
}
