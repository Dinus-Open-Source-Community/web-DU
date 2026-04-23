import type { Metadata } from 'next'
import Hero from '@/components/home/Hero'
import GuestLayout from '../components/layout/GuestLayout'
import Feature from '@/components/home/Feature'
import Benefit from '@/components/home/Benefit'
import Community from '@/components/home/Community'
import { BookIcons, CertificateIcons, GlobeLearningIcon, JobIcons } from '@/components/ui/icons'
import type { IProgramFeatures } from '@/lib/types'

export const revalidate = 1800

const featureIconMap: Record<string, React.ReactNode> = {
  book: <BookIcons />,
  globe: <GlobeLearningIcon />,
  job: <JobIcons />,
  certificate: <CertificateIcons />,
}

export const metadata: Metadata = {
  title: 'Beranda',
  description: 'Platform pembelajaran online dengan materi berkualitas dan komunitas terbuka.',
  alternates: {
    canonical: '/',
  },
  keywords: ['belajar coding', 'bootcamp online', 'kelas IT', 'komunitas open source'],
  openGraph: {
    title: 'Beranda',
    description: 'Platform pembelajaran online dengan materi berkualitas dan komunitas terbuka.',
    type: 'website',
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Beranda',
    description: 'Platform pembelajaran online dengan materi berkualitas dan komunitas terbuka.',
  },
}

export default function Home() {
  const programFeatures: IProgramFeatures[] = []
  return (
    <section id="home" className="bg-muted w-full pt-24">
      <GuestLayout>
        <Hero />
        <Feature Data={[]} />
        <Benefit DataFeatures={programFeatures} />
        <Community />
      </GuestLayout>
    </section>
  )
}
