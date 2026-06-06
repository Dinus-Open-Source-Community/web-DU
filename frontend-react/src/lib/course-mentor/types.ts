import type { ICourseMentorItem } from '@/lib/types/user'

/** POST /courses/:id/mentors/assign */
export type AssignMentorsToCoursePayload = {
  mentor_uids: string[]
}

export type AssignMentorsToCourseResponse = {
  course_uid: string
  mentors: Pick<ICourseMentorItem, 'uid' | 'name' | 'email' | 'role'>[]
}
