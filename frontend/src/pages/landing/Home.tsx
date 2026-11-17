import GuestLayout from '../../components/layouts/GuestLayouts'
import Hero from '../../components/landing/Hero'
import CourseSection from '../../components/landing/CourseSection'
import MentorsSection from '../../components/landing/MentorsSection'
import GallerySection from '../../components/landing/GallerySection'
import { SplashSessionProvider } from '../../components/playful/SplashScreen'
import { LandingMotionProvider } from '../../components/playful/LandingMotion'
import ScrollVelocityTape from '../../components/playful/ScrollVelocityTape'
import { useCourses } from '@/hooks/use-course'
import { LANDING_COPY } from '@/lib/landing/copy'

export default function Home() {
  // Prefetch kursus di latar belakang agar perpindahan ke /course langsung siap.
  useCourses({ status: 'ACTIVE', page: 1, per_page: 6 })

  return (
    <LandingMotionProvider>
      <SplashSessionProvider>
        <GuestLayout navbarAuthVariant="home" marketingSurface>
          <main className="w-full overflow-x-clip bg-paper-white">
            <Hero />
            <ScrollVelocityTape items={LANDING_COPY.ticker} />
            <CourseSection />
            <MentorsSection />
            <GallerySection />
          </main>
        </GuestLayout>
      </SplashSessionProvider>
    </LandingMotionProvider>
  )
}
