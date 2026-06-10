import { useQuery } from '@tanstack/react-query'

import { mentorDashboardKeys } from './query-keys'
import type { IQueryParamsPayload } from '@/services/api-path'
import {
  fetchMentorDashboardKpis,
  fetchMentorDashboardSchedules,
  type MentorDashboardSchedulesParams,
} from '@/services/mentor-dashboard'

const DEFAULT_SCHEDULE_PARAMS: MentorDashboardSchedulesParams = {
  limit: 50,
}

export function useMentorDashboard(
  scheduleParams: MentorDashboardSchedulesParams = DEFAULT_SCHEDULE_PARAMS,
) {
  const kpis = useQuery({
    queryKey: mentorDashboardKeys.kpis,
    queryFn: fetchMentorDashboardKpis,
    staleTime: 60_000,
  })

  const schedules = useQuery({
    queryKey: mentorDashboardKeys.schedules(scheduleParams as IQueryParamsPayload),
    queryFn: () => fetchMentorDashboardSchedules(scheduleParams),
    staleTime: 60_000,
  })

  return { kpis, schedules }
}
