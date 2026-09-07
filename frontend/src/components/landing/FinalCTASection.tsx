import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Reveal from '@/components/playful/Reveal'
import { StickerStar, StickerSquiggle } from '@/components/playful/Stickers'
import { CONTACTS } from '@/lib/landing/contact'
import { LANDING_COPY } from '@/lib/landing/copy'

/**
 * FinalCTASection — penutup landing + Get in Touch. Section terakhir sebelum
 * Footer: bg-paper-white OPOK penuh (footer sticky reveal menutupinya). Judul
 * besar mengundang, dual CTA, chip kontak sosial sebagai "stiker" bulat.
 */
export default function FinalCTASection() {
  const { finalCta } = LANDING_COPY

  return (
    <section
      id="kontak"
      className="relative overflow-hidden bg-paper-white"
    >
      {/* Aksen doodle halus — penutup terasa final tapi hidup */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <StickerStar className="absolute top-[16%] left-[6%] size-8 animate-float text-brand-blue/40" />
        <StickerStar className="absolute right-[8%] bottom-[24%] size-6 animate-float text-note-pink" />
        <StickerSquiggle className="absolute top-[30%] right-[4%] w-24 text-brand-ink/30" />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 py-24 text-center md:px-10 md:py-36">
        <Reveal>
          <h2 className="font-display text-[clamp(2.6rem,6vw,5.5rem)] leading-[0.95] font-bold text-balance text-ink-900">
            {finalCta.title}
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="text-ink-600 mx-auto mt-6 max-w-2xl text-lg leading-relaxed md:text-xl">
            {finalCta.copy}
          </p>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="group/btn h-14 px-8 text-base">
              <Link to={finalCta.primaryCta.href}>
                {finalCta.primaryCta.label}
                <ArrowRight className="size-5 transition-transform duration-300 group-hover/btn:translate-x-1" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-8 text-base">
              <Link to={finalCta.secondaryCta.href}>{finalCta.secondaryCta.label}</Link>
            </Button>
          </div>
        </Reveal>

        {/* Kontak sosial — stiker bulat */}
        <Reveal delay={0.3}>
          <div className="mt-14">
            <p className="text-ink-500 text-xs font-extrabold tracking-[0.25em] uppercase">
              temui kami di
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              {CONTACTS.map((contact) => {
                const Icon = contact.icon
                return (
                  <a
                    key={contact.label}
                    href={contact.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={contact.label}
                    className="text-ink-900 hover:text-brand-blue shadow-button hover:shadow-button-hover grid size-12 place-items-center rounded-full border-2 border-ink-900 bg-paper-white outline-none transition hover:-translate-y-1 hover:bg-note-yellow focus-visible:ring-4 focus-visible:ring-brand-blue/50"
                  >
                    <Icon className="size-5" strokeWidth={2} />
                  </a>
                )
              })}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
