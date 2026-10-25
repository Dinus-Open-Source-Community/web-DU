import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'

import { mentorDashboardKeys } from './query-keys'
import { buildMentorScheduleTimeline } from '@/lib/mentor-dashboard/schedule-chart'
import type { IQueryParamsPayload } from '@/services/api-path'
import {
  fetchMentorDashboardKpis,
  fetchMentorDashboardSchedules,
  type MentorDashboardSchedulesParams,
} from '@/services/mentor-dashboard'

const SCHEDULE_LIMIT = 47

const getMonthGridRange = (date: Date): Pick<MentorDashboardSchedulesParams, 'from' | 'to'> => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1)
  start.setDate(start.getDate() - start.getDay())
  const end = new Date(start)
  end.setDate(end.getDate() + 41)
  const format = (value: Date) => {
    const month = String(value.getMonth() + 1).padStart(2, '0')
    const day = String(value.getDate()).padStart(2, '0')
    return `${value.getFullYear()}-${month}-${day}`
  }
  return { from: format(start), to: format(end) }
}

const DEFAULT_SCHEDULE_PARAMS: MentorDashboardSchedulesParams = {
  ...getMonthGridRange(new Date()),
  include_past: true,
  limit: SCHEDULE_LIMIT,
}

export function useMentorDashboard(
  scheduleParams: MentorDashboardSchedulesParams = DEFAULT_SCHEDULE_PARAMS,
) {
  const kpis = useQuery({
    queryKey: mentorDashboardKeys.kpis,
    queryFn: fetchMentorDashboardKpis,
    staleTime: 60_000,
  })

  const [calendarRange, setCalendarRange] = useState<MentorDashboardSchedulesParams>({
    ...DEFAULT_SCHEDULE_PARAMS,
    ...scheduleParams,
    limit: SCHEDULE_LIMIT,
  })

  const schedules = useQuery({
    queryKey: mentorDashboardKeys.schedules(calendarRange as IQueryParamsPayload),
    queryFn: () => fetchMentorDashboardSchedules(calendarRange),
    staleTime: 60_000,
  })

  const scheduleTimeline = useMemo(
    () => buildMentorScheduleTimeline(schedules.data ?? []),
    [schedules.data],
  )

  return { kpis, schedules, scheduleTimeline, setCalendarRange }
}
