import type { SocialPlatform } from '@/lib/profile/social-links'

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

// TODO: ganti url '#' dengan akun asli tiap mentor sebelum launch.
export function mentorInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
