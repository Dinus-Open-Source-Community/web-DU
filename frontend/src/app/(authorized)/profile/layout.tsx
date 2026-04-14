import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Profil',
  description: 'Pengaturan akun dan keamanan.',
  robots: { index: false, follow: false },
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children
}
