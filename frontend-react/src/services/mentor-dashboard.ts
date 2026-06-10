import type { IResponse } from '@/lib/types/api'
import type { IMentorStats, IScheduleItem } from '@/lib/types/utils'
import type { ClassType } from '@/lib/types/course'
import { api } from './axios'
import { unwrapApiResponse, withApiErrorHandling } from './api-error'
import { API_ROUTES } from './api-path'

export interface MentorDashboardSchedulesParams {
  from?: string
  to?: string
  include_past?: boolean
  limit?: number
}

interface MentorDashboardKpisApi {
  pendingGrading: number
  unansweredQA: number
  activeStudents: number
  totalCourses: number
}

interface MentorScheduleApi {
  uid: string
  courseId: string
  courseName: string
  scheduleDate: string
  scheduleTime: string
  endTime: string
  location: string
  classType: string
  studentCount: number
}

function normalizeClassType(value: string): ClassType {
  return value === 'online' ? 'online' : 'offline'
}

function mapMentorStats(data: MentorDashboardKpisApi): IMentorStats {
  return {
    pendingGrading: Number(data.pendingGrading ?? 0),
    unansweredQA: Number(data.unansweredQA ?? 0),
    activeStudents: Number(data.activeStudents ?? 0),
    totalCourses: Number(data.totalCourses ?? 0),
  }
}

function mapScheduleItem(item: MentorScheduleApi): IScheduleItem {
  return {
    uid: String(item.uid),
    courseId: String(item.courseId),
    courseName: item.courseName,
    scheduleDate: item.scheduleDate,
    scheduleTime: item.scheduleTime,
    endTime: item.endTime,
    location: item.location,
    classType: normalizeClassType(item.classType),
    studentCount: Number(item.studentCount ?? 0),
  }
}

export async function fetchMentorDashboardKpis(): Promise<IMentorStats> {
  return withApiErrorHandling(async () => {
    const response = await api.get<IResponse<MentorDashboardKpisApi>>(
      API_ROUTES.mentor.dashboard.kpis,
    )
    return mapMentorStats(unwrapApiResponse(response.data, 'Gagal mengambil KPI dashboard mentor'))
  }, 'Gagal mengambil KPI dashboard mentor')
}

export async function fetchMentorDashboardSchedules(
  params?: MentorDashboardSchedulesParams,
): Promise<IScheduleItem[]> {
  return withApiErrorHandling(async () => {
    const response = await api.get<IResponse<MentorScheduleApi[]>>(
      API_ROUTES.mentor.dashboard.schedules({
        from: params?.from,
        to: params?.to,
        include_past: params?.include_past,
        limit: params?.limit,
      }),
    )
    const data = unwrapApiResponse(response.data, 'Gagal mengambil jadwal mentor')
    return (data ?? []).map(mapScheduleItem)
  }, 'Gagal mengambil jadwal mentor')
}
