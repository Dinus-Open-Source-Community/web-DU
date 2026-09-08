export type LandingMentor = {
  name: string
  role: string
  /** Satu kalimat wajar tentang mentor — mengisi kartu saat accordion terbuka. */
  tagline: string
}

export const LANDING_MENTORS: LandingMentor[] = [
  {
    name: 'alfi',
    role: 'Next.js Developer',
    tagline: 'Suka ngulik Next.js bareng — dari error hydration sampai halaman jadi.',
  },
  {
    name: 'nafan',
    role: 'Laravel Developer',
    tagline: 'Ngulik Eloquent & Blade bareng — biar query nggak bikin pusing.',
  },
  {
    name: 'jariz',
    role: 'Next.js Developer',
    tagline: 'Senang lihat kode berantakan jadi komponen yang rapi dan kepake.',
  },
]

export function mentorInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
