import {
  AnimatePresence,
  motion,
  useAnimation,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'motion/react'
import { useState, type MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import DoodleArrow from '@/components/playful/DoodleArrow'
import HandUnderline from '@/components/playful/HandUnderline'
import PenguinMascot from '@/components/playful/PenguinMascot'
import Reveal from '@/components/playful/Reveal'
import StickyNote from '@/components/playful/StickyNote'
import { LANDING_COPY } from '@/lib/landing/copy'

const EGG_CLICKS = 5

export default function Hero() {
  const { hero, notes } = LANDING_COPY
  const reduceMotion = useReducedMotion()
  const finePointer =
    typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches
  const parallaxOn = !reduceMotion && finePointer

  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 60, damping: 20 })
  const sy = useSpring(my, { stiffness: 60, damping: 20 })
  const layerAx = useTransform(sx, (v) => v * 20)
  const layerAy = useTransform(sy, (v) => v * 14)
  const layerBx = useTransform(sx, (v) => v * -12)
  const layerBy = useTransform(sy, (v) => v * -10)

  const [boops, setBoops] = useState(0)
  const [eggOn, setEggOn] = useState(false)
  const eggControls = useAnimation()

  const onMouseMove = (e: MouseEvent<HTMLElement>): void => {
    if (!parallaxOn) return
    const rect = e.currentTarget.getBoundingClientRect()
    mx.set(((e.clientX - rect.left) / rect.width - 0.5) * 2)
    my.set(((e.clientY - rect.top) / rect.height - 0.5) * 2)
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

  return (
    <section
      id="top"
      onMouseMove={onMouseMove}
      className="relative overflow-hidden bg-paper-white pt-36 pb-24 md:pt-44"
    >
      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        <Reveal>
          <p className="text-sm font-extrabold tracking-[0.2em] uppercase italic text-brand-ink">
            {hero.eyebrow}
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <h1 className="mt-4 font-display text-[clamp(3.5rem,8vw,8rem)] leading-[0.9] font-bold text-balance text-ink-900">
            {hero.titleA}{' '}
            <span className="relative inline-block">
              {hero.titleB}
              <HandUnderline draw className="absolute -bottom-2 left-0" />
            </span>
          </h1>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="mx-auto mt-6 max-w-2xl text-xl leading-relaxed text-ink-600">{hero.sub}</p>
        </Reveal>
        <Reveal delay={0.24}>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
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

      {/* Lapisan A: sticky notes (parallax halus) */}
      <motion.div
        aria-hidden
        style={parallaxOn ? { x: layerAx, y: layerAy } : undefined}
        className="pointer-events-none absolute inset-0 z-0 hidden lg:block"
      >
        <div className="pointer-events-auto absolute top-[15%] left-[2%]">
          <StickyNote title={notes[0].title} copy={notes[0].copy} index={0} draggable />
        </div>
        <div className="pointer-events-auto absolute top-[24%] right-[2%]">
          <StickyNote title={notes[1].title} copy={notes[1].copy} index={1} draggable />
        </div>
        <div className="pointer-events-auto absolute bottom-[26%] left-[4%]">
          <StickyNote title={notes[2].title} copy={notes[2].copy} index={2} draggable />
        </div>
        <div className="pointer-events-auto absolute right-[3%] bottom-[46%]">
          <StickyNote title={notes[3].title} copy={notes[3].copy} index={3} draggable />
        </div>
        <div className="pointer-events-auto absolute bottom-[5%] left-1/2 -translate-x-1/2">
          <StickyNote title={notes[4].title} copy={notes[4].copy} index={4} draggable />
        </div>
      </motion.div>

      {/* Lapisan B: doodle arrows (parallax arah berlawanan) */}
      <motion.div
        aria-hidden
        style={parallaxOn ? { x: layerBx, y: layerBy } : undefined}
        className="pointer-events-none absolute inset-0 z-0 hidden lg:block"
      >
        <DoodleArrow variant="right" className="absolute top-[46%] left-[6%] w-20 -rotate-12" />
        <DoodleArrow
          variant="loop"
          className="absolute top-[30%] right-[12%] w-20 rotate-12 text-brand-ink"
        />
      </motion.div>

      {/* Pinguin + easter egg */}
      <div className="relative z-0 mx-auto mt-4 flex max-w-md justify-center lg:absolute lg:right-[5%] lg:bottom-8 lg:mt-0 lg:max-w-none">
        <div className="relative">
          <button
            type="button"
            onClick={boop}
            aria-label="Sapa pinguin"
            className="pointer-events-auto cursor-pointer bg-transparent"
          >
            <motion.div animate={eggControls}>
              <PenguinMascot className="w-40 -rotate-3 md:w-52" />
            </motion.div>
          </button>
          <AnimatePresence>
            {eggOn && (
              <motion.p
                role="status"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute -top-10 left-1/2 -translate-x-1/2 -rotate-3 rounded-xl border-2 border-ink-900 bg-note-yellow px-3 py-1 text-sm font-extrabold whitespace-nowrap text-ink-900 shadow-paper"
              >
                wark!
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
