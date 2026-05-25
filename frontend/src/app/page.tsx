import type { Metadata } from 'next'
import Hero from '@/components/home/Hero'
import GuestLayout from '../components/layout/GuestLayout'
import Feature from '@/components/home/Feature'
import Benefit from '@/components/home/Benefit'
import Community from '@/components/home/Community'
import { BookIcons, CertificateIcons, GlobeLearningIcon, JobIcons } from '@/components/ui/icons'
import type { IProgramFeatures } from '@/lib/types'

import { listCourses } from '@/lib/data/repository'

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
  const programFeatures: IProgramFeatures[] = [
    {
      title: 'Materi OSS nyata',
      description: 'Berlatih lewat proyek komunitas Doscom yang bisa kamu kontribusikan ke portofolio.',
      icon: featureIconMap.book,
    },
    {
      title: 'Jaringan profesional',
      description: 'Networking dengan mentor industri dan sesama kontributor open source.',
      icon: featureIconMap.globe,
    },
    {
      title: 'Proyek kerja tim',
      description: 'Simulasi sprint tim sekaligus code review untuk mirip lingkungan kerja.',
      icon: featureIconMap.job,
    },
    {
      title: 'Sertifikat partisipasi',
      description: 'Bukti pembelajaran resmi setelah menyelesai modul capstone.',
      icon: featureIconMap.certificate,
    },
  ]
  const featuredCourses = listCourses().filter((c) => c.status === 'published').slice(0, 8)
  return (
    <section id="home" className="bg-muted w-full pt-24">
      <GuestLayout>
        <Hero />
        <Feature Data={featuredCourses} />
        <Benefit DataFeatures={programFeatures} />
        <Community />
      </GuestLayout>
    </section>
  )
}
