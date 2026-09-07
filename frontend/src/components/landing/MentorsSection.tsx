import SectionHeader from '@/components/playful/SectionHeader'
import MentorCard from '@/components/landing/MentorCard'
import { StickerTape } from '@/components/playful/Stickers'
import { LANDING_MENTORS } from '@/lib/landing/mentors'
import { LANDING_COPY } from '@/lib/landing/copy'

/**
 * Our Mentors — section paper dengan deretan kartu mentor (MentorCard existing,
 * zero-icon). Dibiarkan "statis & tenang" (spec: paper statis) dengan aksen tape
 * di tepi + kartu sebagai panggung. Kontras irama setelah StackSection navy.
 */
export default function MentorsSection() {
  const { mentors } = LANDING_COPY

  return (
    <section id="mentor" className="relative overflow-hidden bg-paper-white">
      {/* Tape dekoratif di tepi atas kertas */}
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden md:block">
        <StickerTape className="absolute top-5 left-[12%] w-24 -rotate-6" />
        <StickerTape className="absolute top-5 right-[16%] w-20 rotate-3" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-24 md:px-10 md:py-32">
        <SectionHeader
          eyebrow={mentors.eyebrow}
          title={mentors.title}
          copy={mentors.copy}
          className="mx-auto max-w-3xl"
        />

        {/* Panggung mentor: 4 kartu kapsul foto, grid rapi 1→2→4. */}
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {LANDING_MENTORS.map((mentor, i) => (
            <div key={mentor.name} className="h-[440px]">
              <MentorCard mentor={mentor} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
