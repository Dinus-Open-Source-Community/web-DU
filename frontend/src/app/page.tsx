import type { Metadata } from 'next'
import Hero from "@/components/home/Hero"
import GuestLayout from "../components/layout/GuestLayout"
import Feature from "@/components/home/Feature"
import Benefit from "@/components/home/Benefit"
import { DataCourse, ProgramFeatures } from "@/lib/dummyData"
import { isMockDataEnabled } from "@/lib/config/mock-data"
import Community from "@/components/home/Community"

export const metadata: Metadata = {
  title: 'Beranda',
  description: 'Platform pembelajaran online dengan materi berkualitas dan komunitas terbuka.',
  openGraph: {
    title: 'Beranda',
    description: 'Platform pembelajaran online dengan materi berkualitas dan komunitas terbuka.',
  },
}

export default function Home() {
  const showFixtures = isMockDataEnabled()
  return (
    <section id="home" className="bg-muted w-full pt-24">
      <GuestLayout>
        <Hero />
        <Feature Data={showFixtures ? DataCourse : []} />
        <Benefit DataFeatures={showFixtures ? ProgramFeatures : []} />
        <Community />
      </GuestLayout>
    </section>
  )
}
