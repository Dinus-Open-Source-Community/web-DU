import { IScheduleItem } from '@/lib/types'

export type CalendarSource = 'google' | 'backend' | 'local'

export interface MentorCalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  source: CalendarSource
  updatedAt: string
  timezone: string
  status: 'confirmed' | 'pending' | 'cancelled'
  resource: {
    courseId: string
    courseName: string
    classType: 'online' | 'offline'
    location: string
    studentCount: number
  }
}

// Backward-compatible alias for existing imports in the codebase.
export type CalendarEvent = MentorCalendarEvent

const MONTH_NAME_TO_INDEX: Record<string, number> = {
  jan: 0,
  january: 0,
  januari: 0,
  feb: 1,
  february: 1,
  februari: 1,
  mar: 2,
  march: 2,
  maret: 2,
  apr: 3,
  april: 3,
  may: 4,
  mei: 4,
  jun: 5,
  june: 5,
  juni: 5,
  jul: 6,
  july: 6,
  juli: 6,
  aug: 7,
  august: 7,
  agustus: 7,
  sep: 8,
  september: 8,
  oct: 9,
  october: 9,
  oktober: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
  desember: 11,
}

const parseNamedDate = (rawDate: string): Date | null => {
  const parts = rawDate.trim().split(/\s+/)
  if (parts.length < 3) {
    return null
  }

  const day = Number(parts[0])
  const monthToken = parts[1].toLowerCase()
  const year = Number(parts[2])
  const monthIndex = MONTH_NAME_TO_INDEX[monthToken]

  if (!Number.isFinite(day) || !Number.isFinite(year) || monthIndex === undefined) {
    return null
  }

  return new Date(year, monthIndex, day)
}

const parseScheduleDate = (scheduleDate: string): Date | null => {
  // Handles YYYY-MM-DD and full ISO date strings from backend payloads.
  if (/^\d{4}-\d{2}-\d{2}/.test(scheduleDate)) {
    const normalized = scheduleDate.includes('T') ? scheduleDate : `${scheduleDate}T00:00:00`
    const parsed = new Date(normalized)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }

  return parseNamedDate(scheduleDate)
}

const parseTimeParts = (rawTime: string): { hours: number; minutes: number } => {
  const [hoursRaw, minutesRaw] = rawTime.split(':')
  const hours = Number(hoursRaw)
  const minutes = Number(minutesRaw)

  return {
    hours: Number.isFinite(hours) ? Math.min(Math.max(hours, 0), 23) : 0,
    minutes: Number.isFinite(minutes) ? Math.min(Math.max(minutes, 0), 59) : 0,
  }
}

const buildDateTime = (baseDate: Date, rawTime: string): Date => {
  const { hours, minutes } = parseTimeParts(rawTime)
  return new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), hours, minutes, 0, 0)
}

export const convertScheduleToCalendarEvents = (schedules: IScheduleItem[], source: CalendarSource = 'local'): MentorCalendarEvent[] => {
  return schedules.map((schedule) => {
    const parsedDate = parseScheduleDate(schedule.scheduleDate) ?? new Date()
    const start = buildDateTime(parsedDate, schedule.scheduleTime)
    const end = buildDateTime(parsedDate, schedule.endTime)

    return {
      id: schedule.uid,
      title: schedule.courseName,
      start,
      end,
      source,
      updatedAt: new Date().toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      status: 'confirmed',
      resource: {
        courseId: schedule.courseId,
        courseName: schedule.courseName,
        classType: schedule.classType,
        location: schedule.location,
        studentCount: schedule.studentCount,
      },
    }
  })
}

export const sortCalendarEvents = (events: MentorCalendarEvent[]): MentorCalendarEvent[] => {
  return [...events].sort((left, right) => left.start.getTime() - right.start.getTime())
}

export const normalizeCalendarEvents = (events: MentorCalendarEvent[]): MentorCalendarEvent[] => {
  const deduped = new Map<string, MentorCalendarEvent>()

  for (const event of events) {
    const key = `${event.id}-${event.start.toISOString()}-${event.end.toISOString()}`
    const existing = deduped.get(key)

    if (!existing) {
      deduped.set(key, event)
      continue
    }

    const existingUpdatedAt = Date.parse(existing.updatedAt)
    const incomingUpdatedAt = Date.parse(event.updatedAt)

    if (Number.isNaN(existingUpdatedAt) || incomingUpdatedAt > existingUpdatedAt) {
      deduped.set(key, event)
    }
  }

  return sortCalendarEvents(Array.from(deduped.values()))
}

export const isSameCalendarDay = (left: Date, right: Date): boolean => {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate()
}

/**
 * Google Calendar API Integration Setup (Future)
 *
 * To integrate with Google Calendar:
 * 1. Create Google Cloud project and enable Google Calendar API
 * 2. Create OAuth 2.0 credentials
 * 3. Install: npm install @react-oauth/google google-auth-library-react-native
 * 4. Replace dummy data fetching with Google Calendar API calls
 *
 * Example integration pattern:
 * const { gapi } = window
 * const response = await gapi.client.calendar.events.list({
 *   calendarId: 'primary',
 *   timeMin: startDate.toISOString(),
 *   timeMax: endDate.toISOString(),
 *   singleEvents: true,
 *   orderBy: 'startTime'
 * })
 * return convertGoogleCalendarToEvents(response.result.items)
 */
