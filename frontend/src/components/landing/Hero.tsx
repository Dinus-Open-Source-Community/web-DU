import {
  AnimatePresence,
  motion,
  useAnimation,
  useReducedMotion,
} from 'motion/react'
import { useState, type MouseEvent, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Footprints from '@/components/playful/Footprints'
import HandUnderline from '@/components/playful/HandUnderline'
import PenguinMascot from '@/components/playful/PenguinMascot'
import Reveal from '@/components/playful/Reveal'
import { StickerStar, StickerTape } from '@/components/playful/Stickers'
import { LANDING_COPY } from '@/lib/landing/copy'

gsap.registerPlugin(useGSAP)

const EGG_CLICKS = 5

const NOTE_BG = [
  'bg-note-yellow',
  'bg-note-mint',
  'bg-note-peach',
  'bg-note-pink',
  'bg-note-sky',
  'bg-note-lavender',
] as const

type HeroNoteProps = {
  title: string
  copy: string
  index: number
  className?: string
}

/**
 * Sticky note hero — versi lokal (bukan StickyNote bawaan) supaya drag
 * benar-benar bebas: snap kembali ke asal, elastis, bisa "dilempar".
 *
 * Transform berlapis tanpa konflik (tiap lapis elemen berbeda):
 *  - data-hero-note (div, GSAP loop): "kertas bernapas" translate/rotate mikro
 *  - div absolute (ref wrap): parallax mouse (gsap.to)
 *  - HeroNote motion.div (child): drag elastis + hover lift
 */
function HeroNote({ title, copy, index, className }: HeroNoteProps) {
  const reduceMotion = useReducedMotion()
  const slot = index % NOTE_BG.length
  return (
    <motion.div
      drag={!reduceMotion}
      dragSnapToOrigin
      dragElastic={0.55}
      whileDrag={!reduceMotion ? { scale: 1.08, rotate: 0, cursor: 'grabbing' } : undefined}
      whileHover={!reduceMotion ? { scale: 1.05, rotate: 0 } : undefined}
      whileTap={!reduceMotion ? { scale: 0.95 } : undefined}
      className={cn(
        'relative min-w-40 cursor-grab touch-none rounded-sm px-5 pt-6 pb-4 shadow-paper select-none',
        NOTE_BG[slot],
        className,
      )}
    >
      <span
        aria-hidden
        className="absolute -top-2.5 left-1/2 h-[18px] w-[62px] -translate-x-1/2 -rotate-3 bg-[rgba(111,119,128,0.28)]"
      />
      <p className="text-sm leading-snug font-extrabold text-ink-900">{title}</p>
      {copy ? <p className="mt-1 text-xs leading-snug text-ink-900/80">{copy}</p> : null}
    </motion.div>
  )
}

type HeroNotePlacement = {
  noteIndex: number
  wrapClass: string
  tiltClass: string
  /** Amplitudo gerak GSAP (px / deg / scale) — beda tiap note agar tak sinkron. */
  float: { y: number; rot: number }
}

const NOTE_PLACEMENTS: HeroNotePlacement[] = [
  // Gugusan organik di kolom kanan; fase & amplitudo beda → "kertas bernapas" tak serempak.
  {
    noteIndex: 0,
    wrapClass: 'top-[4%] left-[8%]',
    tiltClass: '-rotate-3',
    float: { y: -9, rot: 2.5 },
  },
  {
    noteIndex: 1,
    wrapClass: 'top-[30%] right-[2%]',
    tiltClass: 'rotate-2',
    float: { y: 7, rot: -2 },
  },
  {
    noteIndex: 2,
    wrapClass: 'top-[56%] left-[2%]',
    tiltClass: '-rotate-2',
    float: { y: -6, rot: 3 },
  },
  {
    noteIndex: 3,
    wrapClass: 'bottom-[20%] right-[2%]',
    tiltClass: 'rotate-3',
    float: { y: 9, rot: -2.5 },
  },
  {
    noteIndex: 4,
    wrapClass: 'bottom-[10%] left-[30%]',
    tiltClass: 'rotate-1',
    float: { y: -8, rot: 2 },
  },
]

export default function Hero() {
  const { hero, notes } = LANDING_COPY
  const reduceMotion = useReducedMotion()
  const finePointer =
    typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches
  const parallaxOn = !reduceMotion && finePointer
  const sectionRef = useRef<HTMLElement>(null)
  const noteWrapRefs = useRef<(HTMLDivElement | null)[]>([])

  const [boops, setBoops] = useState(0)
  const [eggOn, setEggOn] = useState(false)
  const eggControls = useAnimation()

  const onMouseMove = (e: MouseEvent<HTMLElement>): void => {
    if (!parallaxOn) return
    const rect = e.currentTarget.getBoundingClientRect()
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2
    const wraps = noteWrapRefs.current.filter((el): el is HTMLDivElement => el !== null)
    gsap.to(wraps, {
      x: nx * 14,
      y: ny * 10,
      duration: 0.6,
      ease: 'power2.out',
      overwrite: 'auto',
    })
  }

  const onMouseLeave = (): void => {
    if (!parallaxOn) return
    gsap.to(noteWrapRefs.current.filter((el): el is HTMLDivElement => el !== null), {
      x: 0,
      y: 0,
      duration: 0.8,
      ease: 'power2.out',
    })
  }

  const boop = (): void => {
    if (reduceMotion) return
    const next = boops + 1
    if (next >= EGG_CLICKS) {
      setBoops(0)
      setEggOn(true)
      void eggControls.start({ rotate: [0, 360], transition: { duration: 0.6 } })
      window.setTimeout(() => setEggOn(false), 2500)
    } else {
      setBoops(next)
    }
  }

  // Loop GSAP utama: "kertas bernapas" — tiap note orbit mikro dengan fase beda.
  // Mati total saat reduced-motion. Hanya transform/opacity.
  useGSAP(
    () => {
      if (reduceMotion) return
      const wraps = noteWrapRefs.current.filter((el): el is HTMLDivElement => el !== null)
      if (wraps.length === 0) return

      const tl = gsap.timeline({ repeat: -1, yoyo: true })
      wraps.forEach((wrap, i) => {
        const amp = NOTE_PLACEMENTS[i % NOTE_PLACEMENTS.length].float
        const noteEl = wrap.querySelector('[data-hero-note]')
        if (!noteEl) return
        tl.to(
          noteEl,
          {
            y: amp.y,
            rotate: amp.rot,
            duration: 2.2,
            ease: 'sine.inOut',
            delay: i * 0.4,
          },
          0,
        )
      })
      // denyut sangat halus pada headline "itu sepi." — tidak pernah >0.8deg
      tl.to(
        '[data-hero-titleb]',
        { rotate: 0.7, duration: 3.6, ease: 'sine.inOut' },
        0,
      )
    },
    { scope: sectionRef },
  )

  return (
    <section
      id="top"
      ref={sectionRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="relative overflow-hidden bg-paper-white pt-32 pb-32 md:pt-44 md:pb-40"
    >
      {/* Latar: grid kertas grafik halus */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #050914 1px, transparent 1px), linear-gradient(to bottom, #050914 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      {/* Tape & bintang di tepi kertas */}
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden md:block">
        <StickerTape className="absolute top-4 right-[12%] w-24 -rotate-6" />
        <StickerTape className="absolute top-4 left-[6%] w-20 rotate-3" />
        <StickerStar className="absolute top-[22%] right-[4%] size-8 animate-float text-brand-blue/40" />
        <StickerStar className="absolute bottom-[14%] left-[3%] size-6 animate-float text-brand-ink/30" />
      </div>

      {/* Konten utama — asimetris editorial: teks kiri, panggung notes kanan */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-6">
          {/* Kolom kiri: headline bintang mutlak */}
          <div>
            {/* Tanpa pill/eyebrow — headline langsung berbicara */}
            <Reveal>
              <h1 className="font-display text-[clamp(3rem,7vw,7.5rem)] leading-[0.9] font-bold text-ink-900 [text-wrap:balance]">
                <span className="inline-block transition-transform duration-300 ease-out hover:-rotate-1">
                  {hero.titleA}
                </span>{' '}
                <span
                  data-hero-titleb
                  className="relative inline-block transition-transform duration-300 ease-out hover:rotate-1"
                >
                  {hero.titleB}
                  <HandUnderline draw className="absolute -bottom-3 left-0" />
                </span>
              </h1>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="mt-8 max-w-xl">
                <p className="text-lg leading-relaxed text-ink-600 md:text-xl">{hero.sub}</p>
                <Footprints className="mt-4 opacity-60 [&_svg]:w-4" />
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <Button asChild size="lg" className="h-14 px-8 text-base">
                  <Link to={hero.primaryCta.href}>
                    {hero.primaryCta.label}
                    <ArrowRight className="size-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-14 px-8 text-base">
                  <Link to={hero.secondaryCta.href}>{hero.secondaryCta.label}</Link>
                </Button>
              </div>
            </Reveal>
          </div>

          {/* Kolom kanan: panggung notes — GSAP loop + parallax mouse + drag */}
          <div className="relative hidden h-full min-h-[520px] lg:block">
            <StickerStar className="absolute top-[18%] right-[4%] size-6 animate-twinkle text-brand-blue/40" />
            <StickerStar className="absolute bottom-[30%] left-[4%] size-4 animate-twinkle text-ink-900/20" />
            {NOTE_PLACEMENTS.map((placement) => {
              const note = notes[placement.noteIndex]
              return (
                <div
                  key={placement.noteIndex}
                  ref={(el) => {
                    noteWrapRefs.current[placement.noteIndex] = el
                  }}
                  className={cn('pointer-events-auto absolute', placement.wrapClass)}
                >
                  {/* Lapisan GSAP loop — menerima translate/rotate mikro tanpa ganggu drag child */}
                  <div data-hero-note={placement.noteIndex}>
                    <HeroNote
                      title={note.title}
                      copy={note.copy}
                      index={placement.noteIndex}
                      className={placement.tiltClass}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Pinguin — mengintip kanan-bawah */}
      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 bottom-0 z-10',
          'hidden justify-end pr-[4%] md:flex',
        )}
      >
        <div className="pointer-events-auto relative">
          <button
            type="button"
            onClick={boop}
            aria-label="Sapa pinguin"
            className="block cursor-pointer bg-transparent"
          >
            <motion.div
              animate={eggControls}
              whileHover={!reduceMotion ? { rotate: -3, scale: 1.04 } : undefined}
              whileTap={!reduceMotion ? { scale: 0.94 } : undefined}
            >
              <PenguinMascot className="w-36 -rotate-2 md:w-44" />
            </motion.div>
          </button>
          <AnimatePresence>
            {eggOn && (
              <motion.p
                role="status"
                initial={{ opacity: 0, y: 8, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                className="absolute -top-12 left-1/2 -translate-x-1/2 -rotate-3 rounded-xl border-2 border-ink-900 bg-note-yellow px-3 py-1 text-sm font-extrabold whitespace-nowrap text-ink-900 shadow-paper"
              >
                wark!
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Ajakan mobile: pinguin + teks */}
      <div className="relative z-10 mx-auto mt-16 max-w-md px-6 text-center md:hidden">
        <button
          type="button"
          onClick={boop}
          aria-label="Sapa pinguin"
          className="mx-auto block cursor-pointer bg-transparent"
        >
          <PenguinMascot className="w-28 -rotate-3" />
        </button>
        <p className="text-ink-500 mt-2 text-xs font-bold tracking-wider uppercase">
          ketuk pinguin 5x — ada rahasia
        </p>
      </div>
    </section>
  )
}
