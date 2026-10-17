import GuestLayout from '../../components/layouts/GuestLayouts'
import CourseSection from '../../components/landing/CourseSection'
import GallerySection from '../../components/landing/GallerySection'
import Hero from '../../components/landing/Hero'
import MentorsSection from '../../components/landing/MentorsSection'
import { SplashSessionProvider } from '../../components/playful/SplashScreen'
import ScrollVelocityTape from '../../components/playful/ScrollVelocityTape'
import { LANDING_COPY } from '@/lib/landing/copy'

export default function Home() {
  return (
    <SplashSessionProvider>
    <GuestLayout navbarAuthVariant="home" marketingSurface>
      <main className="w-full">
        <Hero />
        <ScrollVelocityTape items={LANDING_COPY.ticker} />
        <MentorsSection />
        <CourseSection />
        <GallerySection />
      </main>
    </GuestLayout>
    </SplashSessionProvider>
  )
}
