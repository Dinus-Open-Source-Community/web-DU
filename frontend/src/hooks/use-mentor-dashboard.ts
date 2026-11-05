import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'

import { mentorDashboardKeys } from './query-keys'
import type { IQueryParamsPayload } from '@/services/api-path'
import type { IScheduleItem, TimelinePoint } from '@/lib/types/utils'
import {
  fetchMentorDashboardKpis,
  fetchMentorDashboardSchedules,
  type MentorDashboardSchedulesParams,
} from '@/services/mentor-dashboard'

const SCHEDULE_LIMIT = 47
const MAX_CHART_DAYS = 14

function formatScheduleDateLabel(scheduleDate: string): string {
  const [year, month, day] = scheduleDate.split('-').map(Number)
  const date = new Date(year, month - 1, day)

  if (Number.isNaN(date.getTime())) return scheduleDate

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
  }).format(date)
}

function buildMentorScheduleTimeline(schedules: IScheduleItem[]): TimelinePoint[] {
  const schedulesByDate = new Map<string, { sessions: number; students: number }>()

  schedules.forEach((schedule) => {
    const current = schedulesByDate.get(schedule.scheduleDate) ?? {
      sessions: 0,
      students: 0,
    }

    schedulesByDate.set(schedule.scheduleDate, {
      sessions: current.sessions + 1,
      students: current.students + schedule.studentCount,
    })
  })

  return Array.from(schedulesByDate.entries())
    .sort(([firstDate], [secondDate]) => firstDate.localeCompare(secondDate))
    .slice(0, MAX_CHART_DAYS)
    .map(([scheduleDate, totals]) => ({
      label: formatScheduleDateLabel(scheduleDate),
      sessions: totals.sessions,
      students: totals.students,
    }))
}

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
