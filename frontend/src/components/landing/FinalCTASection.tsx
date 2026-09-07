import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Reveal from '@/components/playful/Reveal'
import { StickerStar } from '@/components/playful/Stickers'
import { CONTACTS } from '@/lib/landing/contact'
import { LANDING_COPY } from '@/lib/landing/copy'

/**
 * FinalCTASection — penutup landing: judul besar + CTA. Kontak sosial
 * dipindah ke dua kolom (label + ikon), bukan stiker bulat yang mengambang.
 * Dua aksen diam (tanpa float) supaya mata berhenti di CTA.
 */
export default function FinalCTASection() {
  const { finalCta } = LANDING_COPY

  return (
    <section
      id="kontak"
      className="relative overflow-hidden bg-paper-white"
    >
      {/* Aksen diam — hiasan, bukan gerak */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <StickerStar className="absolute top-[14%] left-[5%] size-7 text-brand-blue/30" />
        <StickerStar className="absolute right-[7%] bottom-[22%] size-5 text-note-pink/70" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-24 md:px-10 md:py-32">
        <div className="grid items-center gap-14 lg:grid-cols-12">
          {/* CTA besar */}
          <div className="lg:col-span-7">
            <Reveal>
              <h2 className="font-display text-[clamp(2.6rem,6vw,5.5rem)] leading-[0.95] font-bold text-balance text-ink-900">
                {finalCta.title}
              </h2>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="text-ink-600 mt-6 max-w-xl text-lg leading-relaxed md:text-xl">
                {finalCta.copy}
              </p>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row">
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
          </div>

          {/* Kontak — dua kolom rapi, bukan stiker bulat */}
          <Reveal delay={0.25} className="lg:col-span-5">
            <div className="rounded-[24px] border-2 border-ink-900 bg-paper-panel p-6 shadow-paper sm:p-8">
              <p className="text-ink-500 text-xs font-extrabold tracking-[0.25em] uppercase">
                temui kami di
              </p>
              <ul className="mt-5 space-y-3">
                {CONTACTS.map((contact) => {
                  const Icon = contact.icon
                  const isPlaceholder = contact.href === '#'
                  return (
                    <li key={contact.label}>
                      {isPlaceholder ? (
                        <span
                          aria-disabled="true"
                          className="text-ink-400 group flex items-center gap-4 rounded-2xl border-2 border-dashed border-ink-900/40 bg-paper-panel px-4 py-3"
                        >
                          <span className="grid size-10 shrink-0 place-items-center rounded-xl border-2 border-dashed border-ink-900/30 bg-note-yellow/40 opacity-70">
                            <Icon className="size-5" strokeWidth={2} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-extrabold tracking-wide uppercase opacity-70">
                              {contact.label}
                            </span>
                            <span className="block text-xs font-semibold italic">
                              segera hadir
                            </span>
                          </span>
                        </span>
                      ) : (
                        <a
                          href={contact.href}
                          aria-label={contact.label}
                          className="text-ink-900 hover:text-brand-ink focus-visible:ring-brand-blue/50 group flex items-center gap-4 rounded-2xl border-2 border-ink-900 bg-paper-white px-4 py-3 shadow-button outline-none transition-all duration-200 hover:-translate-y-0.5 hover:shadow-button-hover focus-visible:ring-4"
                        >
                          <span className="grid size-10 shrink-0 place-items-center rounded-xl border-2 border-ink-900 bg-note-yellow/60">
                            <Icon className="size-5" strokeWidth={2} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-extrabold tracking-wide uppercase">
                              {contact.label}
                            </span>
                          </span>
                        </a>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

