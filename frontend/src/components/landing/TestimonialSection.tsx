import { Star } from 'lucide-react'
import SectionHeader from '@/components/playful/SectionHeader'
import Reveal from '@/components/playful/Reveal'
import { StickerSparkle, StickerTape } from '@/components/playful/Stickers'
import { TESTIMONIALS } from '@/lib/landing/testimonial'
import { LANDING_COPY } from '@/lib/landing/copy'

/**
 * TestimonialSection — "napas" setelah section interaktif: dark navy yang
 * tenang dengan satu kartu testimoni paper besar. Quote mark oversized sebagai
 * dekorasi tipografis (bukan ikon), 5 bintang amber.
 */

const RATING = [0, 1, 2, 3, 4] as const

export default function TestimonialSection() {
  const { testimonial } = LANDING_COPY
  const item = TESTIMONIALS[0]

  return (
    <section id="testimoni" className="relative overflow-hidden bg-ink-800">
      {/* Grid kertas halus di atas navy */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <StickerSparkle twinkle className="absolute top-[12%] right-[7%] size-7 text-brand-soft/30" />
        <StickerSparkle twinkle className="absolute bottom-[14%] left-[5%] size-5 text-brand-soft/25" />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 py-24 md:px-10 md:py-32">
        <SectionHeader
          dark
          eyebrow={testimonial.eyebrow}
          title={testimonial.title}
          className="mx-auto max-w-3xl"
        />

        <Reveal className="mt-16">
          {item ? (
            <figure className="relative rounded-[28px] border-2 border-ink-900 bg-paper-white px-6 py-12 text-center shadow-paper sm:px-14">
              {/* Tape pojok */}
              <StickerTape className="absolute top-0 left-10 -rotate-6" />
              <StickerTape className="absolute top-0 right-10 rotate-6" />

              {/* Quote mark oversized — dekorasi tipografis */}
              <span
                aria-hidden
                className="font-display text-ink-900/10 absolute -top-7 left-6 text-[7rem] leading-none font-bold select-none"
              >
                &ldquo;
              </span>

              {/* Rating */}
              <div className="flex justify-center gap-1" aria-label="Rating 5 dari 5">
                {RATING.map((i) => (
                  <Star
                    key={i}
                    aria-hidden
                    className="size-5 fill-chart-3 text-chart-3"
                    strokeWidth={1.5}
                  />
                ))}
              </div>

              <blockquote className="text-ink-900 mx-auto mt-6 max-w-2xl text-xl leading-relaxed font-medium sm:text-2xl">
                {item.quote}
              </blockquote>

              <figcaption className="mt-8">
                <p className="font-display text-lg font-bold text-ink-900">{item.name}</p>
                <p className="text-ink-500 mt-0.5 text-sm font-bold">{item.role}</p>
              </figcaption>
            </figure>
          ) : (
            <p className="text-paper-white/60 text-center">Testimoni segera hadir.</p>
          )}
        </Reveal>
      </div>
    </section>
  )
}
