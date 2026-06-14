import type { IScheduleItem, TimelinePoint } from '@/lib/types/utils'

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

export function buildMentorScheduleTimeline(
  schedules: IScheduleItem[],
): TimelinePoint[] {
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
