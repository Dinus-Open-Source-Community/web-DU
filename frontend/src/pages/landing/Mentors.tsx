import GuestLayout from '../../components/layouts/GuestLayouts'
import MentorCard from '@/components/landing/MentorCard'
import SectionHeader from '@/components/playful/SectionHeader'
import { LANDING_MENTORS } from '@/lib/landing/mentors'
import { LANDING_COPY } from '@/lib/landing/copy'

export default function MentorsPage() {
  const { mentors } = LANDING_COPY

  return (
    <GuestLayout navbarAuthVariant="home" marketingSurface>
      <main className="w-full">
        <section className="relative overflow-hidden bg-paper-offwhite">
          <div className="relative mx-auto max-w-7xl px-6 pt-24 pb-16 md:px-10 md:pt-28 md:pb-24">
            <SectionHeader
              eyebrow={mentors.eyebrow}
              title={mentors.title}
              copy={mentors.copy}
              className="mx-auto max-w-3xl"
            />

            <div className="mt-10 grid grid-cols-2 gap-3 sm:mt-14 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
              {LANDING_MENTORS.map((mentor, i) => (
                <MentorCard key={mentor.name} mentor={mentor} index={i} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </GuestLayout>
  )
}
