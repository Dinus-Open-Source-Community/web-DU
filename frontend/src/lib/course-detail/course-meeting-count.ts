import type { ICourseDetailItem } from '@/lib/types/course'

type CourseWithMeetings = ICourseDetailItem & {
  meetingCount?: number
  meetings?: readonly { uid?: string }[]
}

export function getCourseMeetingCount(course: ICourseDetailItem): number {
  const courseWithMeetings = course as CourseWithMeetings
  const directCount = courseWithMeetings.meetingCount
  if (typeof directCount === 'number' && Number.isFinite(directCount) && directCount >= 1) {
    return Math.floor(directCount)
  }

  const meetings = courseWithMeetings.meetings
  if (Array.isArray(meetings) && meetings.length > 0) {
    return meetings.length
  }

  return 1
}
