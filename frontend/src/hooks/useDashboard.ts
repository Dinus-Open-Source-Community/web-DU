import { useMemo } from 'react'
import {
  getDashboardStats,
  getDeadlines,
  getFeedbacks,
  getResumeCourses,
} from '@/lib/data/repository'
import { isMockDataEnabled } from '@/lib/config/mock-data'
import type { IDashboardStat, IDeadlineItem, IFeedbackItem, IResumeCourse } from '@/lib/types'

function emptyDashboard() {
  return {
    kpiStats: [] as IDashboardStat[],
    deadlines: [] as IDeadlineItem[],
    feedbacks: [] as IFeedbackItem[],
    resumeCourses: [] as IResumeCourse[],
  }
}

/**
 * Data dashboard siswa; sementara dari fixture jika mock aktif.
 * Ganti dengan fetch API + TanStack Query saat backend siap.
 */
export function useDashboardData() {
  const stats = useMemo(() => {
    if (!isMockDataEnabled()) return emptyDashboard()
    return {
      kpiStats: getDashboardStats(),
      deadlines: getDeadlines(),
      feedbacks: getFeedbacks(),
      resumeCourses: getResumeCourses(),
    }
  }, [])

  return {
    stats,
    isLoading: false,
    error: null,
  }
}

export function useDashboardStats() {
  const stats = useMemo(() => (isMockDataEnabled() ? getDashboardStats() : ([] as IDashboardStat[])), [])
  return {
    stats,
    isLoading: false,
  }
}

export function useDeadlines() {
  const deadlines = useMemo(() => (isMockDataEnabled() ? getDeadlines() : ([] as IDeadlineItem[])), [])
  return {
    deadlines,
    isLoading: false,
  }
}

export function useFeedbacks() {
  const feedbacks = useMemo(() => (isMockDataEnabled() ? getFeedbacks() : ([] as IFeedbackItem[])), [])
  return {
    feedbacks,
    isLoading: false,
  }
}

export function useResumeCourses(limit?: number) {
  const courses = useMemo(() => {
    const data = isMockDataEnabled() ? getResumeCourses() : ([] as IResumeCourse[])
    return limit ? data.slice(0, limit) : data
  }, [limit])

  return {
    courses,
    totalCount: isMockDataEnabled() ? getResumeCourses().length : 0,
    isLoading: false,
  }
}
