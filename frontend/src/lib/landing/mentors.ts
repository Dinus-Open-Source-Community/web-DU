export type LandingMentor = { name: string; role: string }

/** LAUNCH GATE: ganti 4 sampel dengan daftar mentor asli (nama + peran). */
export const LANDING_MENTORS: LandingMentor[] = [
  { name: 'Rizky Pratama', role: 'Mentor Web Development' },
  { name: 'Sinta Maharani', role: 'Mentor Machine Learning' },
  { name: 'Bagas Aditya', role: 'Mentor Open Source' },
  { name: 'Nadia Putri', role: 'Mentor UI Engineering' },
]

export function mentorInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
