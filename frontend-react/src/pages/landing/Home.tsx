import type { IProgramFeatures } from '../../lib/types/utils'
import Benefit from '../../components/home/Benefit'
import Community from '../../components/home/Community'
import Feature from '../../components/home/Feature'
import Hero from '../../components/home/Hero'
import GuestLayout from '../../components/layouts/GuestLayouts'

export default function Home() {
  const programFeatures: IProgramFeatures[] = []
  return (
    <GuestLayout>
      <section id="home" className="bg-muted w-full ">
        <Hero />
        <Feature Data={[]} />
        <Benefit DataFeatures={programFeatures} />
        <Community />
      </section>
    </GuestLayout>
  )
}
