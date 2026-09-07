import GuestLayout from '../../components/layouts/GuestLayouts'
import CourseSection from '../../components/landing/CourseSection'
import FinalCTASection from '../../components/landing/FinalCTASection'
import GallerySection from '../../components/landing/GallerySection'
import Hero from '../../components/landing/Hero'
import MentorsSection from '../../components/landing/MentorsSection'
import StackSection from '../../components/landing/StackSection'
import TerminalSection from '../../components/landing/TerminalSection'
import TestimonialSection from '../../components/landing/TestimonialSection'
import SplashScreen from '../../components/playful/SplashScreen'
import ScrollVelocityTape from '../../components/playful/ScrollVelocityTape'
import { LANDING_COPY } from '@/lib/landing/copy'

export default function Home() {
  return (
    <GuestLayout>
      <SplashScreen />
      <main className="w-full bg-paper-white">
        <Hero />
        <StackSection />
        <ScrollVelocityTape items={LANDING_COPY.ticker} />
        <MentorsSection />
        <CourseSection />
        <TerminalSection />
        {/* [PlaygroundSection — arcade "sampai PR di-merge" menyusul di sini] */}
        <GallerySection />
        <TestimonialSection />
        <FinalCTASection />
      </main>
    </GuestLayout>
  )
}
