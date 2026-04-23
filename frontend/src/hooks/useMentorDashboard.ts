'use client'

import { useMemo } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getMentorDashboardStats, listSchedules } from '@/lib/data/repository'
import { isMockDataEnabled } from '@/lib/config/mock-data'
import type { IScheduleItem } from '@/lib/types'

const MENTOR_SCHEDULES_ENDPOINT = process.env.NEXT_PUBLIC_MENTOR_SCHEDULES_ENDPOINT

const isScheduleItem = (value: unknown): value is IScheduleItem => {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.uid === 'string' &&
    typeof candidate.courseId === 'string' &&
    typeof candidate.courseName === 'string' &&
    typeof candidate.scheduleDate === 'string' &&
    typeof candidate.scheduleTime === 'string' &&
    typeof candidate.endTime === 'string' &&
    typeof candidate.location === 'string' &&
    (candidate.classType === 'online' || candidate.classType === 'offline') &&
    typeof candidate.studentCount === 'number'
  )
}

const extractScheduleCandidates = (payload: unknown): unknown[] => {
  if (Array.isArray(payload)) {
    return payload
  }

  if (typeof payload !== 'object' || payload === null) {
    return []
  }

  const root = payload as Record<string, unknown>

  if (Array.isArray(root.schedules)) {
    return root.schedules
  }

  if (typeof root.data === 'object' && root.data !== null) {
    const data = root.data as Record<string, unknown>
    if (Array.isArray(data.schedules)) {
      return data.schedules
    }
    if (Array.isArray(data.events)) {
      return data.events
    }
  }

  return []
}

const fallbackSchedules = (): IScheduleItem[] => (isMockDataEnabled() ? listSchedules() : [])

const fetchMentorSchedules = async (): Promise<IScheduleItem[]> => {
  if (!MENTOR_SCHEDULES_ENDPOINT) {
    return fallbackSchedules()
  }

  try {
    const response = await fetch(MENTOR_SCHEDULES_ENDPOINT, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch schedules (${response.status})`)
    }

    const payload = await response.json()
    const candidates = extractScheduleCandidates(payload)
    const normalized = candidates.filter(isScheduleItem)

    return normalized.length > 0 ? normalized : fallbackSchedules()
  } catch {
    return fallbackSchedules()
  }
}

export const useMentorDashboard = () => {
  const initialSchedules = useMemo(() => fallbackSchedules(), [])

  const schedulesQuery = useSuspenseQuery({
    queryKey: ['mentor-dashboard', 'calendar-events'],
    queryFn: fetchMentorSchedules,
    initialData: initialSchedules,
    staleTime: 60_000,
    refetchInterval: MENTOR_SCHEDULES_ENDPOINT ? 20_000 : false,
    refetchIntervalInBackground: Boolean(MENTOR_SCHEDULES_ENDPOINT),
    refetchOnWindowFocus: Boolean(MENTOR_SCHEDULES_ENDPOINT),
  })

  const data = useMemo(
    () => ({
      stats: isMockDataEnabled() ? getMentorDashboardStats() : { pendingGrading: 0, unansweredQA: 0, activeStudents: 0, totalCourses: 0 },
      schedules: schedulesQuery.data ?? initialSchedules,
      isLoading: false,
      isRefreshing: schedulesQuery.isFetching,
      error: schedulesQuery.error,
    }),
    [schedulesQuery.data, schedulesQuery.error, schedulesQuery.isFetching, initialSchedules],
  )

  return data
}
