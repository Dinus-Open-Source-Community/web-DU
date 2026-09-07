import {
  AnimatePresence,
  motion,
  useAnimation,
  useReducedMotion,
} from 'motion/react'
import { useState, type MouseEvent, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Award, Code2, GitBranch, Sparkles, Users } from 'lucide-react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Footprints from '@/components/playful/Footprints'
import HandUnderline from '@/components/playful/HandUnderline'
import PenguinMascot from '@/components/playful/PenguinMascot'
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
  icon: React.ReactNode
  index: number
  className?: string
}

const NOTE_ICONS = [GitBranch, Users, Code2, Award, Sparkles] as const

/**
 * Sticky note hero — versi lokal supaya drag benar-benar bebas.
 * Pola 3-lapis transform (tiap lapis elemen berbeda, tanpa konflik):
 *  - div ref (parallax wrapper): parallax mouse via gsap.to
 *  - div [data-hero-note]: GSAP entrance + loop + signature gust
 *  - HeroNote motion.div (child): drag elastis + hover lift
 */
function HeroNote({ title, icon, index, className }: HeroNoteProps) {
  const reduceMotion = useReducedMotion()
  const slot = index % NOTE_BG.length
  return (
    <motion.div
      drag={!reduceMotion}
      dragSnapToOrigin
      dragElastic={0.55}
      whileDrag={!reduceMotion ? { scale: 1.08, rotate: 0, cursor: 'grabbing' } : undefined}
      whileHover={!reduceMotion ? { scale: 1.06, rotate: 0 } : undefined}
      whileTap={!reduceMotion ? { scale: 0.94 } : undefined}
      className={cn(
        'relative cursor-grab touch-none px-5 pt-6 pb-4 shadow-paper select-none',
        NOTE_BG[slot],
        className,
      )}
    >
      <span
        aria-hidden
        className="absolute -top-2.5 left-1/2 h-[18px] w-[62px] -translate-x-1/2 -rotate-3 bg-[rgba(111,119,128,0.28)]"
      />
      <div className="flex items-center gap-2 text-ink-900">
        <span className="shrink-0 [&_svg]:size-6">{icon}</span>
        <p className="text-lg leading-snug font-extrabold">{title}</p>
      </div>
    </motion.div>
  )
}

type NoteOrbit = {
  noteIndex: number
  wrapClass: string
  tiltClass: string
  /** Amplitudo loop melayang: px / deg / durasi — beda tiap note. */
  bob: { y: number; rot: number; dur: number }
  /** Tunda mulai loop (detik). Periode beda → fase terus bergeser, tak pernah sinkron. */
  delayStart: number
}

const NOTE_ORBITS: NoteOrbit[] = [
  // 5 notes mengelilingi konten center (komposisi referensi CANVAS).
  {
    noteIndex: 0,
    wrapClass: 'top-[16%] left-[4%]',
    tiltClass: '-rotate-3',
    bob: { y: 12, rot: 2, dur: 3.2 },
    delayStart: 0,
  },
  {
    noteIndex: 1,
    wrapClass: 'top-[24%] right-[5%]',
    tiltClass: 'rotate-2',
    bob: { y: -11, rot: -2, dur: 3.6 },
    delayStart: 0.9,
  },
  {
    noteIndex: 2,
    wrapClass: 'bottom-[30%] left-[6%]',
    tiltClass: '-rotate-2',
    bob: { y: 13, rot: -2.5, dur: 3.4 },
    delayStart: 1.7,
  },
  {
    noteIndex: 3,
    wrapClass: 'right-[6%] bottom-[24%]',
    tiltClass: 'rotate-3',
    bob: { y: -12, rot: 2.5, dur: 3.8 },
    delayStart: 2.4,
  },
  {
    noteIndex: 4,
    wrapClass: 'bottom-[8%] left-1/2 -translate-x-1/2',
    tiltClass: 'rotate-1',
    bob: { y: 10, rot: -1.5, dur: 3.3 },
    delayStart: 1.2,
  },
]

export default function Hero() {
  const { hero, notes } = LANDING_COPY
  const reduceMotion = useReducedMotion()
  const finePointer =
    typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches
  const parallaxOn = !reduceMotion && finePointer
  const sectionRef = useRef<HTMLElement>(null)
  const noteRefs = useRef<(HTMLDivElement | null)[]>([])
  const entrancePlayed = useRef(false)

  const [boops, setBoops] = useState(0)
  const [eggOn, setEggOn] = useState(false)
  const eggControls = useAnimation()

  const onMouseMove = (e: MouseEvent<HTMLElement>): void => {
    if (!parallaxOn) return
    const rect = e.currentTarget.getBoundingClientRect()
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2
    const els = noteRefs.current.filter((el): el is HTMLDivElement => el !== null)
    gsap.to(els, {
      x: nx * 12,
      y: ny * 8,
      duration: 0.7,
      ease: 'power2.out',
      overwrite: 'auto',
    })
  }

  const onMouseLeave = (): void => {
    if (!parallaxOn) return
    gsap.to(noteRefs.current.filter((el): el is HTMLDivElement => el !== null), {
      x: 0,
      y: 0,
      duration: 0.9,
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

  // GSAP: entrance + loop hidup + signature gust. Mati total saat reduced-motion.
  useGSAP(
    () => {
      if (reduceMotion) return
      const wraps = noteRefs.current.filter((el): el is HTMLDivElement => el !== null)
      if (wraps.length === 0) return
      // GSAP menimpa lapisan data-hero-note (child dari wrap parallax) supaya
      // tidak bentrok dgn parallax mouse di wrap. Drag tetap di HeroNote child.
      const els = wraps
        .map((w) => w.querySelector('[data-hero-note]'))
        .filter((el): el is Element => el !== null)

      // --- 1) ENTRANCE: notes jatuh satu-per-satu, konten naik ---
      if (!entrancePlayed.current) {
        entrancePlayed.current = true
        const tl = gsap.timeline()
        tl.from('[data-hero-title]', { y: 40, opacity: 0, duration: 0.7, ease: 'power3.out' })
          .from(
            '[data-hero-sub]',
            { y: 18, opacity: 0, duration: 0.5, ease: 'power2.out' },
            '-=0.3',
          )
          .from(
            '[data-hero-cta]',
            { y: 14, opacity: 0, duration: 0.45, ease: 'power2.out' },
            '-=0.25',
          )
        els.forEach((el, i) => {
          tl.from(
            el,
            {
              y: -140 - i * 18,
              opacity: 0,
              rotate: i % 2 === 0 ? -10 : 10,
              duration: 0.85,
              ease: 'back.out(1.4)',
            },
            i === 0 ? 0.15 : '-=0.55',
          )
        })
      }

      // --- 2) LOOP melayang kasat mata: tiap note bob beda fase/durasi (independen).
      // delay = fase + 2.6s (menunggu entrance jatuh selesai) → wow dulu, lalu hidup. ---
      els.forEach((el, i) => {
        const o = NOTE_ORBITS[i % NOTE_ORBITS.length].bob
        const delayStart = NOTE_ORBITS[i % NOTE_ORBITS.length].delayStart
        gsap.to(el, {
          y: o.y,
          rotate: o.rot,
          duration: o.dur / 2,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: delayStart + 2.6,
        })
      })

      // --- 3) SIGNATURE: note kanan-bawah (indeks 3) sesekali "tertiup angin".
      // Hanya menyentuh x (loop pegang y/rotate) supaya tidak saling timpa. ---
      const gustTarget = els[3]
      if (gustTarget) {
        gsap.to(gustTarget, {
          x: 16,
          duration: 1.6,
          ease: 'sine.inOut',
          repeat: 1,
          yoyo: true,
          repeatDelay: 3,
          delay: 4.5,
        })
      }

      // Reset flag saat context di-revert (StrictMode dev double-invoke) agar
      // entrance bisa diputar ulang pada invoke kedua yang "nyata".
      return () => {
        entrancePlayed.current = false
      }
    },
    { scope: sectionRef },
  )

  return (
    <section
      id="top"
      ref={sectionRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="relative overflow-hidden bg-paper-white pt-36 pb-36 md:pt-44 md:pb-44"
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

      {/* Konten center editorial (referensi CANVAS): wordmark, sub, CTA */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        <h1
          data-hero-title
          className="font-display text-[clamp(3.2rem,8vw,8.5rem)] leading-[0.88] font-bold text-ink-900 [text-wrap:balance]"
        >
          {hero.titleA}{' '}
          <span className="relative inline-block whitespace-nowrap">
            {hero.titleB}
            <HandUnderline draw className="absolute -bottom-3 left-0" />
          </span>
        </h1>

        <div data-hero-sub className="mx-auto mt-8 max-w-2xl">
          <p className="text-lg leading-relaxed text-ink-600 md:text-xl">{hero.sub}</p>
          <Footprints className="mt-5 justify-center opacity-60 [&_svg]:w-4" />
        </div>

        <div data-hero-cta className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg" className="group/button h-14 px-8 text-base">
            <Link to={hero.primaryCta.href}>
              {hero.primaryCta.label}
              <ArrowRight className="size-5 transition-transform duration-300 group-hover/button:translate-x-1" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-14 px-8 text-base">
            <Link to={hero.secondaryCta.href}>{hero.secondaryCta.label}</Link>
          </Button>
        </div>
      </div>

      {/* Petunjuk arah ke bawah: ada terminal, cerita, galeri — bukan CTA yang
          menghilang di atas fold. Satu-satunya momen bob yang mengarah ke scroll. */}
      <Link
        to="/#terminal"
        aria-label={hero.scrollTease}
        className="group relative z-10 mx-auto mt-16 flex w-fit flex-col items-center gap-1.5 rounded-full px-5 py-2 outline-none focus-visible:ring-4 focus-visible:ring-brand-blue/50"
      >
        <span className="text-ink-500 text-xs font-extrabold tracking-[0.18em] uppercase">
          {hero.scrollTease}
        </span>
        <span aria-hidden className="animate-bob-slow text-brand-blue transition-transform duration-300 group-hover:translate-y-0.5">
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </Link>

      {/* Gugusan notes mengelilingi konten (5 posisi referensi) — GSAP entrance+loop+parallax */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 hidden lg:block">
        {NOTE_ORBITS.map((orbit) => {
          const note = notes[orbit.noteIndex]
          return (
            <div
              key={orbit.noteIndex}
              ref={(el) => {
                noteRefs.current[orbit.noteIndex] = el
              }}
              className={cn('pointer-events-auto absolute', orbit.wrapClass)}
            >
              <div data-hero-note={orbit.noteIndex}>
                <HeroNote
                  title={note.title}
                  icon={(() => {
                    const Icon = NOTE_ICONS[orbit.noteIndex % NOTE_ICONS.length]
                    return <Icon />
                  })()}
                  index={orbit.noteIndex}
                  className={orbit.tiltClass}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Pinguin — mengintip kanan-bawah */}
      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 bottom-0 z-10',
          'hidden justify-end pr-[5%] md:flex',
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
              <PenguinMascot className="w-32 -rotate-2 md:w-40" />
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
