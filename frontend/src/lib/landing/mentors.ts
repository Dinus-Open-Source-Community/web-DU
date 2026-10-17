import type { SocialPlatform } from '@/lib/profile/social-links'

export type MentorSocial = {
  platform: SocialPlatform
  url: string
}

export type LandingMentor = {
  name: string
  role: string
  /** Foto profil persegi (public/). */
  photo: string
  /** Course yang diajar — tampil sebagai chip di kartu & daftar di modal. */
  courses: string[]
  /** Sosmed mentor (platform + URL). URL '#' = placeholder sampai ada akun asli. */
  socials: MentorSocial[]
}

// TODO: ganti url '#' dengan akun asli tiap mentor sebelum launch.
export const LANDING_MENTORS: LandingMentor[] = [
  {
    name: 'alfi',
    role: 'Pengembang Next.js',
    photo: '/images/alfi.webp',
    courses: ['Pengembangan Web: Next.js'],
    socials: [
      { platform: 'github', url: '#' },
      { platform: 'instagram', url: '#' },
      { platform: 'linkedin', url: '#' },
    ],
  },
  {
    name: 'nafan',
    role: 'Pengembang Laravel',
    photo: '/images/nafan.webp',
    courses: ['Pengembangan Web: Laravel'],
    socials: [
      { platform: 'github', url: '#' },
      { platform: 'instagram', url: '#' },
      { platform: 'linkedin', url: '#' },
    ],
  },
  {
    name: 'jariz',
    role: 'Pengembang Next.js',
    photo: '/images/jariz.webp',
    courses: ['Pengembangan Web: Next.js'],
    socials: [
      { platform: 'github', url: '#' },
      { platform: 'instagram', url: '#' },
      { platform: 'linkedin', url: '#' },
    ],
  },
]

export function mentorInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
