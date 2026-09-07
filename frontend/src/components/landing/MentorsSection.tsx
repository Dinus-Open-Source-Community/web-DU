import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import SectionHeader from '@/components/playful/SectionHeader'
import MentorCard from '@/components/landing/MentorCard'
import { StickerTape } from '@/components/playful/Stickers'
import { LANDING_MENTORS } from '@/lib/landing/mentors'
import { LANDING_COPY } from '@/lib/landing/copy'

/**
 * Our Mentors — deretan kartu kapsul foto dengan pola hover-expand (accordion
 * horizontal) di layar lg+: kartu yang di-hover/fokus melebar & menampilkan
 * nama+role, kartu lain menyempit. Di bawah lg: grid normal (1→2 kolom) dan
 * semua kartu menampilkan nama+role (efek expand tak masuk akal di stack).
 */
export default function MentorsSection() {
  const { mentors } = LANDING_COPY
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  // Inisialisasi sinkron dari matchMedia (hindari flash grid→accordion di desktop).
  const [isLg, setIsLg] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 1024px)').matches : false,
  )

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const update = () => setIsLg(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

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

        {isLg ? (
          /* Accordion horizontal: kartu aktif (hover/focus) melebar, sisanya menyempit. */
          <div
            className="mx-auto mt-16 flex h-[460px] max-w-6xl items-stretch gap-3"
            onMouseLeave={() => setActiveIndex(null)}
          >
            {LANDING_MENTORS.map((mentor, i) => {
              const isActive = activeIndex === i
              return (
                <div
                  key={mentor.name}
                  onMouseEnter={() => setActiveIndex(i)}
                  onFocus={() => setActiveIndex(i)}
                  onBlur={() => setActiveIndex(null)}
                  tabIndex={0}
                  aria-label={`${mentor.name} — ${mentor.role}`}
                  aria-expanded={isActive}
                  className={cn(
                    'min-w-0 cursor-pointer rounded-[36px] outline-none transition-[flex-grow,flex-basis] duration-500 ease-out focus-visible:ring-4 focus-visible:ring-brand-blue/50',
                    isActive ? 'basis-0 grow-[2.4]' : 'grow basis-0',
                  )}
                >
                  <MentorCard mentor={mentor} index={i} active={isActive} />
                </div>
              )
            })}
          </div>
        ) : (
          /* Grid normal (mobile/tablet): semua kartu menampilkan nama+role. */
          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {LANDING_MENTORS.map((mentor, i) => (
              <div key={mentor.name} className="h-[420px]">
                <MentorCard mentor={mentor} index={i} active />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

