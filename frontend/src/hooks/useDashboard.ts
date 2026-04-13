import { useMemo } from 'react'
import { DashboardStats, Deadlines, Feedbacks, ResumeCourses } from '@/lib/dummyData'

/**
 * Hook untuk fetch dashboard statistics
 * Returns KPI cards, deadlines, feedback, dan courses yang sedang diambil
 * Data sumber: dummyData.tsx
 */
export function useDashboardData() {
  const stats = useMemo(
    () => ({
      kpiStats: DashboardStats,
      deadlines: Deadlines,
      feedbacks: Feedbacks,
      resumeCourses: ResumeCourses,
    }),
    [],
  )

  return {
    stats,
    isLoading: false,
    error: null,
  }
}

/**
 * Hook khusus untuk KPI statistics
 */
export function useDashboardStats() {
  const stats = useMemo(() => DashboardStats, [])
  return {
    stats,
    isLoading: false,
  }
}

/**
 * Hook khusus untuk deadlines
 */
export function useDeadlines() {
  const deadlines = useMemo(() => Deadlines, [])
  return {
    deadlines,
    isLoading: false,
  }
}

/**
 * Hook khusus untuk feedbacks
 */
export function useFeedbacks() {
  const feedbacks = useMemo(() => Feedbacks, [])
  return {
    feedbacks,
    isLoading: false,
  }
}

/**
 * Hook khusus untuk courses yang sedang diambil
 */
export function useResumeCourses(limit?: number) {
  const courses = useMemo(() => {
    const data = ResumeCourses
    return limit ? data.slice(0, limit) : data
  }, [limit])

  return {
    courses,
    totalCount: ResumeCourses.length,
    isLoading: false,
  }
}
