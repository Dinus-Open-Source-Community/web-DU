import GuestLayout from '../../components/layouts/GuestLayouts'
import CourseSection from '../../components/landing/CourseSection'
import FinalCTASection from '../../components/landing/FinalCTASection'
import GallerySection from '../../components/landing/GallerySection'
import Hero from '../../components/landing/Hero'
import HowItWorksSection from '../../components/landing/HowItWorksSection'
import MentorsSection from '../../components/landing/MentorsSection'
import StackSection from '../../components/landing/StackSection'
import StorySection from '../../components/landing/StorySection'
import TerminalSection from '../../components/landing/TerminalSection'
import TestimonialSection from '../../components/landing/TestimonialSection'
import SplashScreen from '../../components/playful/SplashScreen'
import TickerTape from '../../components/playful/TickerTape'
import { LANDING_COPY } from '@/lib/landing/copy'

export default function Home() {
  return (
    <GuestLayout>
      <SplashScreen />
      <main className="w-full bg-paper-white">
        <Hero />
        <StackSection />
        <TickerTape items={LANDING_COPY.ticker} />
        <MentorsSection />
        <CourseSection />
        <TerminalSection />
        <StorySection />
        <HowItWorksSection />
        <GallerySection />
        <TestimonialSection />
        <FinalCTASection />
      </main>
    </GuestLayout>
  )
}
