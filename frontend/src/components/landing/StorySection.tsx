import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import SectionHeader from '@/components/playful/SectionHeader'
import Reveal from '@/components/playful/Reveal'
import { StickerTape } from '@/components/playful/Stickers'
import { Button } from '@/components/ui/button'
import { STORY_NODES, STORY_START } from '@/lib/landing/story'
import { LANDING_COPY } from '@/lib/landing/copy'

/**
 * StorySection — "buku pilihanmu": cerita interaktif bercabang (9 node, 3
 * ending). Node = lembar kertas dengan narasi + pilihan; ending = halaman
 * penutup dengan CTA. Jejak pilihan tampil sebagai chip di atas.
 */

type TrailStep = { id: string; label: string }

export default function StorySection() {
  const { story } = LANDING_COPY
  const reduceMotion = useReducedMotion()
  const [currentId, setCurrentId] = useState<string>(STORY_START)
  const [trail, setTrail] = useState<TrailStep[]>([])

  const node = STORY_NODES[currentId]
  const isEnding = Boolean(node.ending)
  const contentRef = useRef<HTMLDivElement>(null)

  // Pindahkan fokus ke konten cerita setelah user memilih (tombol lama sudah
  // unmount). Tidak fokus saat mount awal agar tidak mencuri scroll halaman.
  const hasChosen = trail.length > 0
  useEffect(() => {
    if (hasChosen) contentRef.current?.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentId])

  const choose = (label: string, next: string): void => {
    setTrail((prev) => [...prev, { id: `${currentId}-${next}`, label }])
    setCurrentId(next)
  }

  const restart = (): void => {
    setTrail([])
    setCurrentId(STORY_START)
  }

  const transition = reduceMotion
    ? undefined
    : {
        initial: { opacity: 0, y: 14 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 },
        transition: { duration: 0.3, ease: 'easeOut' as const },
      }

  return (
    <section id="cerita" className="relative overflow-hidden bg-paper-panel">
      <div className="mx-auto max-w-4xl px-6 py-24 md:px-10 md:py-32">
        <SectionHeader
          eyebrow={story.eyebrow}
          title={story.title}
          copy={story.copy}
          className="mx-auto max-w-3xl"
        />

        <Reveal className="mt-16">
          <div className="relative overflow-hidden rounded-[20px] border-2 border-ink-900 bg-paper-white shadow-paper">
            {/* Tape pojok */}
            <StickerTape className="absolute top-0 left-10 z-10 -rotate-6" />
            <StickerTape className="absolute top-0 right-10 z-10 rotate-6" />

            <div className="p-6 pt-10 sm:p-10 sm:pt-12">
              {/* Jejak pilihan */}
              {trail.length > 0 ? (
                <div
                  aria-label="Jejak pilihanmu"
                  className="flex flex-wrap items-center gap-1.5 pb-5"
                >
                  {trail.map((step, i) => (
                    <span key={step.id} className="flex items-center gap-1.5">
                      {i > 0 ? <span className="text-ink-400 text-xs">→</span> : null}
                      <span className="rounded-full border border-ink-900/25 bg-paper-panel px-2.5 py-0.5 text-[11px] font-bold text-ink-600">
                        {step.label}
                      </span>
                    </span>
                  ))}
                </div>
              ) : null}

              {/* Node / Ending */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentId}
                  ref={contentRef}
                  tabIndex={-1}
                  className="outline-none"
                  {...(transition ?? {})}
                >
                  {isEnding && node.ending ? (
                    /* ---- Ending ---- */
                    <div className="text-center">
                      <span className="inline-block -rotate-1 rounded-lg border-2 border-ink-900 bg-note-yellow px-3 py-1 font-display text-sm font-bold text-ink-900 shadow-button">
                        Ending
                      </span>
                      <h3 className="font-display mt-4 text-3xl font-bold text-ink-900 sm:text-4xl">
                        {node.ending.title}
                      </h3>
                      <p className="text-ink-600 mx-auto mt-3 max-w-md text-base leading-relaxed">
                        {node.ending.copy}
                      </p>
                      <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <Button asChild size="lg" className="h-12 px-7 text-base">
                          <Link to={node.ending.ctaHref}>
                            {node.ending.ctaLabel}
                            <ArrowRight className="size-5" />
                          </Link>
                        </Button>
                        <Button type="button" variant="outline" size="lg" className="h-12 px-6 text-base" onClick={restart}>
                          Ulangi cerita
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* ---- Node cerita ---- */
                    <div>
                      <p className="font-display text-ink-900/30 text-sm font-bold tracking-[0.2em] uppercase">
                        Hari pertamamu
                      </p>
                      <p className="text-ink-900 mt-3 text-lg leading-relaxed sm:text-xl">
                        {node.text}
                      </p>
                      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                        {node.choices.map((choice) => (
                          <button
                            key={`${node.id}-${choice.next}`}
                            type="button"
                            onClick={() => choose(choice.label, choice.next)}
                            className="rounded-[12px] border-2 border-ink-900 bg-paper-white px-5 py-2.5 text-left text-sm font-extrabold text-ink-900 shadow-button transition outline-none hover:-translate-y-0.5 hover:bg-note-yellow hover:shadow-button-hover focus-visible:ring-4 focus-visible:ring-brand-blue/50"
                          >
                            {choice.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
