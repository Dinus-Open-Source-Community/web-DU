import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'motion/react'
import {
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'

/**
 * ScrollVelocityTape — pita marquee yang kecepatan & arahnya terikat scroll
 * velocity. Band tipis setinggi ~1 baris teks besar (bukan section).
 *
 * Pola teknis (dari referensi velocity-scroll):
 *  - baseX digeser tiap frame via useAnimationFrame
 *  - scroll velocity → spring → velocityFactor (lambat saat scroll pelan,
 *    melesat saat scroll cepat, arah mengikuti scroll)
 *  - beberapa salinan konten; salinan ke-2+ aria-hidden; posisi di-wrap
 *    (wrap(-copyWidth, 0, baseX)) agar loop mulus.
 *
 * Reduced-motion: komponen Velocity TIDAK di-render sama sekali (rAF tidak
 * pernah terdaftar) — diganti varian statis satu baris.
 */

export type ScrollVelocityTapeProps = {
  /** Frasa yang ditampilkan berulang (dari LANDING_COPY.ticker oleh parent). */
  items: readonly string[]
  /** Kecepatan dasar saat idle (px/detik). */
  baseVelocity?: number
  className?: string
}

/** Pembungkus agar nilai tetap dalam rentang [min, max). */
function wrap(min: number, max: number, v: number): number {
  const range = max - min
  return ((((v - min) % range) + range) % range) + min
}

const STAR = '✦'

export default function ScrollVelocityTape(props: ScrollVelocityTapeProps) {
  const reduceMotion = useReducedMotion()
  // Reduced-motion: varian statis — rAF/engine velocity tidak pernah dibuat.
  if (reduceMotion) return <StaticTape {...props} />
  return <VelocityTape {...props} />
}

/** Varian reduced-motion: satu baris statis (tanpa duplikat, tanpa animasi). */
function StaticTape({ items, className }: ScrollVelocityTapeProps) {
  return (
    <div className={className}>
      <div className="overflow-x-auto bg-note-yellow">
        <p className="font-display text-ink-900 flex w-max px-6 py-4 text-4xl font-bold tracking-tight whitespace-nowrap md:text-6xl">
          {items.map((item, i) => (
            <span key={item} className="flex items-center">
              <span>{item}</span>
              {i < items.length - 1 ? (
                <span aria-hidden className="text-brand-ink mx-6">
                  {STAR}
                </span>
              ) : null}
            </span>
          ))}
        </p>
      </div>
    </div>
  )
}

/** Varian velocity-scroll (hanya saat animasi diizinkan). */
function VelocityTape({ items, baseVelocity = 60, className }: ScrollVelocityTapeProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const copyRef = useRef<HTMLSpanElement>(null)
  const [copyWidth, setCopyWidth] = useState(0)

  // Ukur lebar satu salinan (client-only). ResizeObserver menjaga saat font
  // selesai dimuat / viewport berubah.
  useLayoutEffect(() => {
    const measure = (): void => {
      const el = copyRef.current
      if (el) setCopyWidth(el.offsetWidth)
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (scrollerRef.current) ro.observe(scrollerRef.current)
    return () => ro.disconnect()
  }, [items])

  const baseX = useMotionValue(0)
  const { scrollY } = useScroll()
  const scrollVelocity = useVelocity(scrollY)
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 })
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 3], { clamp: false })

  useAnimationFrame((_t, delta) => {
    if (copyWidth <= 0) return
    let moveBy = baseVelocity * (delta / 1000)
    const factor = velocityFactor.get()
    if (factor !== 0) moveBy *= factor
    // Arah: scroll bawah (velocity positif) → maju; scroll atas → mundur.
    baseX.set(baseX.get() + moveBy)
  })

  const x = useTransform(baseX, (v) => wrap(-copyWidth, 0, v))
  const style = { x }

  /** Satu salinan penuh: tiap item + pemisah ✦ (dekoratif, aria-hidden). */
  const renderCopy = (ariaHidden: boolean, isFirst: boolean, key?: string): ReactNode => (
    <span
      key={key}
      ref={isFirst ? copyRef : undefined}
      aria-hidden={ariaHidden || undefined}
      className="flex items-center pr-6"
    >
      {items.map((item, i) => (
        <span key={item} className="flex items-center">
          <span aria-hidden={ariaHidden || undefined}>{item}</span>
          {i < items.length - 1 ? (
            <span aria-hidden className="text-brand-ink mx-6">
              {STAR}
            </span>
          ) : null}
        </span>
      ))}
    </span>
  )

  return (
    <div className={className}>
      <div ref={scrollerRef} className="relative overflow-hidden bg-note-yellow py-4">
        <motion.div
          style={style}
          className="font-display text-ink-900 flex w-max text-4xl font-bold tracking-tight whitespace-nowrap md:text-6xl"
        >
          {/* Salinan 1 — konten utama (dibaca sekali). */}
          {renderCopy(false, true, 'copy-0')}
          {/* Salinan 2..6 — dekoratif, aria-hidden (tidak dibaca 2×). */}
          {Array.from({ length: 5 }).map((_, i) => renderCopy(true, false, `copy-${i + 1}`))}
        </motion.div>
      </div>
    </div>
  )
}
