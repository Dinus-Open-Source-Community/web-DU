'use client'

import { useMemo } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getMentorDashboardStats, listSchedules } from '@/lib/data/repository'
import type { IScheduleItem } from '@/lib/types'

export const useMentorDashboard = () => {
  const schedules = useMemo<IScheduleItem[]>(() => listSchedules(), [])

  const schedulesQuery = useSuspenseQuery({
    queryKey: ['mentor-dashboard', 'calendar-events'],
    queryFn: async () => schedules,
    initialData: schedules,
    staleTime: Infinity,
    refetchInterval: false,
    refetchOnWindowFocus: false,
  })

  const data = useMemo(
    () => ({
      stats: getMentorDashboardStats(),
      schedules: schedulesQuery.data ?? schedules,
      isLoading: false,
      isRefreshing: schedulesQuery.isFetching,
      error: schedulesQuery.error,
    }),
    [schedulesQuery.data, schedulesQuery.error, schedulesQuery.isFetching, schedules],
  )

  return data
}
