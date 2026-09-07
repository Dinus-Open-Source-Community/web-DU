import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useReducedMotion } from 'motion/react'
import SectionHeader from '@/components/playful/SectionHeader'
import Reveal from '@/components/playful/Reveal'
import {
  TERMINAL_BOOT,
  TERMINAL_COMMANDS,
  TERMINAL_SUDO,
  unknownCommand,
  type TerminalLine,
} from '@/lib/landing/terminal'
import { LANDING_COPY } from '@/lib/landing/copy'

/**
 * TerminalSection — "kertas yang jadi mesin": jendela terminal ala DOSCOM
 * (navy ink, bukan glossy) dengan logika nyata: boot saat masuk view, perintah
 * via ketik/klik chip, history panah, output aria-live. Reduced-motion membuat
 * semua output langsung muncul tanpa stagger.
 */

const BOOT_DELAY_MS = 120

export default function TerminalSection() {
  const { terminal } = LANDING_COPY
  const reduceMotion = useReducedMotion()

  const [lines, setLines] = useState<TerminalLine[]>([])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [histIndex, setHistIndex] = useState(-1)
  const [booted, setBooted] = useState(false)

  const idRef = useRef(0)
  const timersRef = useRef<number[]>([])
  /** Waktu mulai batch berikutnya (ms) — mengantre batch agar tidak tumpang tindih. */
  const nextStartRef = useRef(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const outputRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)

  const nextId = () => {
    idRef.current += 1
    return idRef.current
  }

  /** Render satu batch baris ke output, berurutan (atau langsung saat reduced-motion).
      Batch diantrekan serial supaya perintah cepat tidak tumpang-tindih. */
  const push = (batch: { text: string; kind: TerminalLine['kind']; href?: string; label?: string }[]) => {
    const items = batch.map((b) => ({ id: nextId(), ...b }))
    if (reduceMotion) {
      setLines((prev) => [...prev, ...items])
      return
    }
    const start = nextStartRef.current
    items.forEach((item, i) => {
      const t = window.setTimeout(() => {
        setLines((prev) => [...prev, item])
      }, start + i * BOOT_DELAY_MS)
      timersRef.current.push(t)
    })
    nextStartRef.current = start + items.length * BOOT_DELAY_MS
  }

  const scrollToBottom = () => {
    const el = outputRef.current
    if (el) el.scrollTop = el.scrollHeight
  }
  useEffect(() => {
    scrollToBottom()
  }, [lines])

  // Boot sekali saat terminal masuk view (margin -120px), via IntersectionObserver.
  useEffect(() => {
    const node = sectionRef.current
    if (!node || booted) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          io.disconnect()
          setBooted(true)
          push(TERMINAL_BOOT.map((text) => ({ text, kind: 'out' as const })))
        }
      },
      { rootMargin: '-120px' },
    )
    io.observe(node)
    return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booted])

  // Bersihkan timer saat unmount.
  useEffect(() => {
    const timers = timersRef.current
    return () => {
      timers.forEach((t) => window.clearTimeout(t))
    }
  }, [])

  const run = (raw: string): void => {
    const trimmed = raw.trim()
    if (!trimmed) return
    const cmdText = `~/doscom $ ${trimmed}`

    if (trimmed === 'sudo') {
      push([{ text: cmdText, kind: 'cmd' }, { text: TERMINAL_SUDO, kind: 'out' }])
    } else {
      const def = TERMINAL_COMMANDS[trimmed]
      if (!def) {
        push([{ text: cmdText, kind: 'cmd' }, { text: unknownCommand(trimmed), kind: 'out' }])
      } else {
        const outs = def.out.map((text) => ({ text, kind: 'out' as const }))
        const cta = def.cta
          ? [{ text: '', kind: 'link' as const, href: def.cta.href, label: def.cta.label }]
          : []
        push([{ text: cmdText, kind: 'cmd' }, ...outs, ...cta])
      }
    }

    setHistory((prev) => (prev[prev.length - 1] === trimmed ? prev : [...prev, trimmed]))
    setHistIndex(-1)
    setInput('')
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    run(input)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (history.length === 0) return
      const next = histIndex === -1 ? history.length - 1 : Math.max(0, histIndex - 1)
      setHistIndex(next)
      setInput(history[next])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (histIndex === -1) return
      const next = histIndex + 1
      if (next >= history.length) {
        setHistIndex(-1)
        setInput('')
      } else {
        setHistIndex(next)
        setInput(history[next])
      }
    }
  }

  const focusInput = (): void => {
    inputRef.current?.focus()
  }

  const chipList = Object.entries(TERMINAL_COMMANDS)

  return (
    <section id="terminal" ref={sectionRef} className="relative overflow-hidden bg-paper-white">
      <div className="mx-auto max-w-5xl px-6 py-24 md:px-10 md:py-32">
        <SectionHeader
          eyebrow={terminal.eyebrow}
          title={terminal.title}
          copy={terminal.copy}
          className="mx-auto max-w-3xl"
        />

        <Reveal className="mt-16">
          <div
            onClick={focusInput}
            className="group cursor-text overflow-hidden rounded-[20px] border-2 border-ink-900 bg-ink-900 shadow-paper transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-button-hover"
          >
            {/* Header bar — titik pastel CSS + label */}
            <div className="flex items-center gap-2 border-b-2 border-ink-900 bg-paper-white px-4 py-2.5">
              <span className="size-3 rounded-full border-2 border-ink-900 bg-note-peach" />
              <span className="size-3 rounded-full border-2 border-ink-900 bg-note-yellow" />
              <span className="size-3 rounded-full border-2 border-ink-900 bg-note-mint" />
              <span className="ml-2 font-mono text-xs font-bold text-ink-600">doscom — zsh</span>
            </div>

            {/* Output */}
            <div
              ref={outputRef}
              role="log"
              aria-live="polite"
              className="h-64 overflow-y-auto px-5 py-4 font-mono text-sm leading-relaxed text-paper-white/90"
            >
              {lines.map((line) => {
                if (line.kind === 'cmd') {
                  return (
                    <p key={line.id} className="text-paper-white">
                      <span className="text-brand-blue font-bold">{line.text.slice(0, line.text.indexOf('$') + 1)}</span>
                      {line.text.slice(line.text.indexOf('$') + 1)}
                    </p>
                  )
                }
                if (line.kind === 'link' && line.href && line.label) {
                  return (
                    <p key={line.id}>
                      <Link
                        to={line.href}
                        className="text-brand-blue underline decoration-2 underline-offset-4 transition hover:text-brand-soft"
                      >
                        {line.label}
                      </Link>
                    </p>
                  )
                }
                return (
                  <p key={line.id} className="text-paper-white/80">
                    {line.text}
                  </p>
                )
              })}
              {lines.length === 0 ? <span className="text-paper-white/40">memuat…</span> : null}
              <span aria-hidden className="ml-0.5 inline-block h-4 w-2 translate-y-0.5 bg-brand-blue" />
            </div>

            {/* Chips perintah */}
            <div className="flex flex-wrap gap-2 border-t-2 border-ink-900 bg-ink-800 px-4 py-3">
              {chipList.map(([name, def]) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => run(name)}
                  className="rounded-full border-2 border-ink-900 bg-paper-white px-3 py-1 font-mono text-xs font-bold text-ink-900 shadow-button transition outline-none hover:-translate-y-0.5 hover:bg-note-yellow hover:shadow-button-hover focus-visible:ring-4 focus-visible:ring-brand-blue/60"
                >
                  {name}
                  <span className="text-ink-500 ml-1.5 hidden font-sans font-semibold sm:inline">
                    {def.desc}
                  </span>
                </button>
              ))}
            </div>

            {/* Input baris */}
            <form
              onSubmit={onSubmit}
              className="flex items-center gap-2 border-t-2 border-ink-900 bg-ink-900 px-4 py-3"
            >
              <span aria-hidden className="font-mono text-sm font-bold text-brand-blue">
                ~/doscom $
              </span>
              <label htmlFor="terminal-input" className="sr-only">
                Ketik perintah terminal
              </label>
              <input
                id="terminal-input"
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                className="min-w-0 flex-1 bg-transparent font-mono text-sm text-paper-white outline-none placeholder:text-paper-white/30"
                placeholder="ketik 'help' lalu Enter…"
              />
            </form>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
