import type { SocialPlatform } from '@/lib/profile/social-links'
import type { MentorApiItem } from '@/services/mentor'

export type MentorSocial = {
  platform: SocialPlatform
  url: string
}

export type LandingMentor = {
  uid: string
  name: string
  email: string
  role: string
  photo: string
  courses: string[]
  assignedCourses: number
  joinedTeachingCourses: number
  isVerified: boolean
  createdAt: string
  socials: MentorSocial[]
  assignments?: {
    course_uid: string
    course_title: string
    status: string
    cover_url: string
    thumbnail_url: string
  }[]
}

export function toLandingMentor(mentor: MentorApiItem): LandingMentor {
  return {
    uid: mentor.uid,
    name: mentor.name,
    email: mentor.email,
    role: mentor.role,
    photo: mentor.avatar_url,
    courses: [],
    assignedCourses: mentor.assigned_courses,
    joinedTeachingCourses: mentor.joined_teach_courses,
    isVerified: mentor.is_verified,
    createdAt: mentor.created_at,
    socials: mentor.social_links ?? [],
  }
}
