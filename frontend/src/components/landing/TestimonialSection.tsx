import { cn } from '@/lib/utils'
import SectionHeader from '@/components/playful/SectionHeader'
import Reveal from '@/components/playful/Reveal'
import { TESTIMONIALS } from '@/lib/landing/testimonial'
import { LANDING_COPY } from '@/lib/landing/copy'

/**
 * TestimonialSection — tiga kartu kutipan bernama (foto mentor, 1:1 crop
 * dari foto kegiatan) di atas navy. Kartu kertas miring dengan tape,
 * bukan lagi satu kartu anonim.
 */

const CARD_TILT = ['-rotate-1 lg:-translate-y-2', 'lg:translate-y-4', 'rotate-1 lg:-translate-y-1'] as const
const NOTE_PIN = ['bg-note-yellow', 'bg-note-mint', 'bg-note-peach'] as const

export default function TestimonialSection() {
  const { testimonial } = LANDING_COPY

  return (
    <section id="testimoni" className="relative overflow-hidden bg-ink-800">
      {/* Garis tepi atas paper — batas tegas sebelum area navy */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-2 bg-paper-white/10" />

      <div className="relative mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-24 lg:py-28">
        <SectionHeader
          dark
          eyebrow={testimonial.eyebrow}
          title={testimonial.title}
          copy={testimonial.copy}
          className="mx-auto max-w-3xl"
        />

        <div className="mt-10 grid grid-cols-1 gap-6 md:mt-16 md:grid-cols-3 md:gap-6 lg:gap-8">
          {TESTIMONIALS.map((item, i) => (
            <Reveal key={item.name} delay={(i % 3) * 0.12} className="h-full">
              <figure
                className={cn(
                  'relative flex h-full flex-col rounded-[24px] border-2 border-ink-900 bg-paper-white p-5 shadow-paper transition-transform duration-300 ease-out hover:-translate-y-1.5 hover:shadow-button-hover sm:p-7',
                  CARD_TILT[i % CARD_TILT.length],
                )}
              >
                {/* Pin pastel di atas kartu */}
                <span
                  aria-hidden
                  className={cn(
                    'absolute -top-3 left-1/2 size-4 -translate-x-1/2 rounded-full border-2 border-ink-900 shadow-button',
                    NOTE_PIN[i % NOTE_PIN.length],
                  )}
                />

                <blockquote className="text-ink-900 flex-1 text-[15px] leading-relaxed font-medium sm:text-base">
                  &ldquo;{item.quote}&rdquo;
                </blockquote>

                <figcaption className="mt-5 flex items-center gap-3 border-t-2 border-dashed border-ink-900/15 pt-4 sm:mt-6 sm:pt-5">
                  <div className="relative size-11 shrink-0 overflow-hidden rounded-full border-2 border-ink-900 bg-paper-panel shadow-button sm:size-12">
                    <img
                      src={item.photo}
                      alt={`Foto ${item.name}`}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover object-[center_30%]"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-display text-ink-900 truncate text-base leading-tight font-bold">
                      {item.name}
                    </p>
                    <p className="text-ink-500 truncate text-xs font-bold">{item.role}</p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
