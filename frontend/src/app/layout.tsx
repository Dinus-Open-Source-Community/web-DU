import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Plus_Jakarta_Sans, Poppins } from 'next/font/google'
import { DuLoader } from '@/components/feedback/DuLoader'
import { AppProviders } from '@/components/providers/app-providers'
import { QueryProvider } from '@/providers/query-provider'
import '../styles/globals.css'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://doscom-university.vercel.app'

const jakartaPlus = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jakarta-plus',
})

// const poppins = Poppins({
//   subsets: ['latin'],
//   weight: ['400', '500', '600', '700'],
//   variable: '--font-poppins',
// })

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Doscom University',
    template: '%s | Doscom University',
  },
  description: 'Platform pembelajaran online untuk menguasai skill teknologi bersama komunitas open source.',
  applicationName: 'Doscom University',
  keywords: ['bootcamp', 'kelas online', 'web development', 'komunitas IT', 'doscom'],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: SITE_URL,
    siteName: 'Doscom University',
    title: 'Doscom University',
    description: 'Platform pembelajaran online untuk menguasai skill teknologi bersama komunitas open source.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Doscom University',
    description: 'Platform pembelajaran online untuk menguasai skill teknologi bersama komunitas open source.',
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${jakartaPlus.variable} font-sans antialiased`}>
        <Suspense
          fallback={
            <div className="flex min-h-dvh items-center justify-center px-4">
              <DuLoader size={52} label="Memuat halaman" />
            </div>
          }>
          <QueryProvider>
            <AppProviders>{children}</AppProviders>
          </QueryProvider>
        </Suspense>
      </body>
    </html>
  )
}
