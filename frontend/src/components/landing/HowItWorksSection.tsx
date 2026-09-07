import { useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SectionHeader from '@/components/playful/SectionHeader'
import { StickerSparkle } from '@/components/playful/Stickers'
import { LANDING_COPY } from '@/lib/landing/copy'

gsap.registerPlugin(useGSAP, ScrollTrigger)

/**
 * HowItWorksSection — "jalur" 3 langkah. Di desktop (≥1024px, tanpa
 * reduced-motion): section di-pin dan tiap langkah "menyala" berurutan mengikuti
 * scroll (scrub 0.6) dengan garis penghubung yang terisi. Mobile /
 * reduced-motion: kartu statis bertumpuk normal (tanpa pin).
 */

export default function HowItWorksSection() {
  const { howItWorks } = LANDING_COPY
  const reduceMotion = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (reduceMotion) return
      const mm = gsap.matchMedia()

      mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        const steps = gsap.utils.toArray<HTMLElement>('[data-step]')
        const connectors = gsap.utils.toArray<HTMLElement>('[data-connector]')
        if (steps.length === 0) return

        const tl = gsap.timeline({
          defaults: { ease: 'power2.out' },
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: '+=160%',
            scrub: 0.6,
            pin: true,
            anticipatePin: 1,
          },
        })

        // Awal: semua langkah redup & turun; garis belum terisi.
        gsap.set(steps, { opacity: 0.25, y: 70 })
        gsap.set(connectors, { scaleX: 0 })

        steps.forEach((step, i) => {
          // Langkah ini naik & menyala.
          tl.to(step, { opacity: 1, y: 0, duration: 0.7 }, i * 0.7)
          // Langkah sebelumnya diredupkan & digeser naik (fokus berpindah).
          if (i > 0) {
            tl.to(steps[i - 1], { opacity: 0.15, y: -18, duration: 0.5 }, i * 0.7 + 0.3)
          }
          // Garis penghubung setelah langkah ini terisi penuh.
          const connector = connectors[i]
          if (connector) {
            tl.to(connector, { scaleX: 1, duration: 0.5 }, i * 0.7 + 0.45)
          }
        })

        return () => {
          tl.scrollTrigger?.kill()
          tl.kill()
        }
      })

      return () => mm.revert()
    },
    { scope: sectionRef },
  )

  return (
    <section id="cara-kerja" ref={sectionRef} className="relative overflow-hidden bg-ink-900">
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
      {/* Aksen twinkle halus */}
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block">
        <StickerSparkle twinkle className="absolute top-[14%] left-[6%] size-7 text-brand-soft/30" />
        <StickerSparkle twinkle className="absolute right-[8%] bottom-[18%] size-6 text-brand-soft/25" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-24 md:px-10 lg:flex lg:min-h-screen lg:flex-col lg:justify-center lg:py-0">
        <SectionHeader
          dark
          eyebrow={howItWorks.eyebrow}
          title={howItWorks.title}
          copy={howItWorks.copy}
          className="mx-auto max-w-3xl"
        />

        {/* Jalur 3 langkah: kartu + garis penghubung (desktop) */}
        <div className="mt-14 flex flex-col items-stretch gap-6 lg:flex-row lg:items-center lg:gap-0">
          {howItWorks.steps.map((step, i) => (
            <div key={step.no} className="flex flex-1 flex-col lg:flex-row lg:items-center">
              <div data-step className="lg:flex-1">
                <div className="h-full rounded-[20px] border-2 border-paper-white/20 bg-paper-white/[0.04] p-6 sm:p-8">
                  <span
                    aria-hidden
                    className="font-display text-6xl leading-none font-bold sm:text-7xl"
                    style={{ WebkitTextStroke: '2px rgba(19,168,255,0.75)', color: 'transparent' }}
                  >
                    {step.no}
                  </span>
                  <h3 className="font-display mt-4 text-2xl font-bold text-paper-white">
                    {step.title}
                  </h3>
                  <p className="text-paper-white/65 mt-2 text-sm leading-relaxed sm:text-base">
                    {step.copy}
                  </p>
                </div>
              </div>
              {/* Garis penghubung ke langkah berikutnya (hanya desktop) */}
              {i < howItWorks.steps.length - 1 ? (
                <div
                  aria-hidden
                  className="relative hidden h-0.5 w-8 shrink-0 overflow-hidden bg-paper-white/15 lg:block"
                >
                  <div
                    data-connector
                    className="absolute inset-0 origin-left bg-brand-blue"
                  />
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <p className="text-paper-white/40 mt-12 text-center text-xs font-bold tracking-[0.2em] uppercase">
          scroll pelan — lihat alurnya
        </p>
      </div>
    </section>
  )
}
