import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Autentikasi — Doscom University',
}

export default function AuthRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
