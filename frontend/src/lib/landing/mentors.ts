export type LandingMentor = {
  name: string
  role: string
  /** Satu kalimat wajar tentang mentor — mengisi kartu saat accordion terbuka. */
  tagline: string
}

export const LANDING_MENTORS: LandingMentor[] = [
  {
    name: 'jar',
    role: 'Mentor Web Development',
    tagline: 'Ngajar React dari sudut pandang orang yang pernah pusing sendiri.',
  },
  {
    name: 'zapp',
    role: 'Mentor Machine Learning',
    tagline: 'Dari data kotor sampai model jalan — semuanya butuh sabar.',
  },
  {
    name: 'naf',
    role: 'Mentor Open Source',
    tagline: 'PR pertamamu bakal di-review, bukan dihakimi.',
  },
]

export function mentorInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
