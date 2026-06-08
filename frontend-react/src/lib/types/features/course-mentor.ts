import type { ICourseMentorItem } from '../data/user'

export interface IAssignMentorsToCoursePayload {
  mentor_uids: string[]
}

export interface IAssignMentorsToCourseResponse {
  course_uid: string
  mentors: Pick<ICourseMentorItem, 'uid' | 'name' | 'email' | 'role'>[]
}

/** Alias backward-compat. */
export type AssignMentorsToCoursePayload = IAssignMentorsToCoursePayload
export type AssignMentorsToCourseResponse = IAssignMentorsToCourseResponse
