import { useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { footerLinks, socialLinks } from '../../lib/navigation'
import PenguinMascot from '../playful/PenguinMascot'
import Reveal from '../playful/Reveal'
import { StickerTape } from '../playful/Stickers'

const LINK_NOTE_PALETTE = [
  { bg: 'bg-note-mint', tilt: '-rotate-1 lg:-translate-x-2' },
  { bg: 'bg-note-peach', tilt: 'rotate-1 lg:translate-x-6 lg:translate-y-4' },
]

export default function Footer() {
  const [email, setEmail] = useState('')
  const { pathname } = useLocation()

  const isFooterHidden = pathname?.startsWith('/course/') && pathname !== '/course'

  const handleSubscribe = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setEmail('')
  }

  if (isFooterHidden) {
    return null
  }

  return (
    <footer className="bg-ink-800 text-paper-white sticky bottom-0 z-0 -mt-20 w-full overflow-hidden md:-mt-24">
      <div className="mx-auto max-w-7xl px-4 pt-10 pb-4 max-sm:pt-5 max-sm:pb-2 sm:px-6 sm:pt-16 sm:pb-8 lg:px-8 lg:pt-24 lg:pb-12">
        {/* Papan pengumuman + kolom jelajah */}
        <div className="grid gap-x-12 gap-y-8 max-sm:gap-y-6 sm:gap-y-16 lg:grid-cols-12 lg:gap-y-20">
          <Reveal className="lg:col-span-7">
            <div className="relative rounded-3xl border-2 border-ink-900 bg-paper-white px-4 py-4 max-sm:px-2.5 max-sm:py-2.5 shadow-paper sm:px-6 sm:py-6 lg:px-10 lg:py-10">
              <StickerTape className="absolute -top-3 left-8 -rotate-6" />
              <StickerTape className="absolute -top-3 right-8 rotate-6" />
              <div className="flex flex-col gap-4 max-sm:gap-2 sm:flex-row sm:items-center sm:gap-6 lg:gap-10">
                <div className="max-w-sm">
                  <p className="text-ink-500 text-xs font-extrabold tracking-[0.2em] uppercase max-sm:text-[10px]">Buletin doscom</p>
                  <h2 className="text-ink-900 font-display mt-2 text-xl leading-[1.04] font-bold tracking-tight max-sm:mt-1 max-sm:text-base sm:text-2xl lg:text-4xl">
                    Jangan sampai kelewat
                  </h2>
                  <p className="text-ink-600 mt-3 max-w-xs text-sm leading-relaxed max-sm:mt-1.5 max-sm:text-xs lg:text-base">
                    Satu email per bulan: info program, jadwal mentoring, dan kisah kontributor DOSCOM.
                  </p>
                </div>
                <form onSubmit={handleSubscribe} className="flex w-full flex-col gap-2 max-sm:flex-row max-sm:items-center sm:max-w-xs lg:gap-3">
                  <label htmlFor="footer-email" className="sr-only">
                    Alamat email
                  </label>
                  <Input
                    id="footer-email"
                    type="email"
                    placeholder="email kamu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-paper-white text-ink-900 placeholder:text-ink-400 flex-1 rounded-[10px] border-2 border-ink-900 py-3 h-auto max-sm:py-2 lg:py-5"
                  />
                  <Button type="submit" className="rounded-[10px] px-6 py-3 h-auto w-full max-sm:w-auto max-sm:shrink-0 max-sm:px-5 max-sm:py-2 sm:w-auto sm:self-start lg:px-7 lg:py-5">
                    Kirim
                  </Button>
                </form>
              </div>
              <PenguinMascot className="pointer-events-none absolute -bottom-6 left-10 hidden w-16 rotate-6 md:block" />
            </div>
          </Reveal>

          <Reveal delay={0.15} className="flex flex-col gap-4 max-sm:gap-3 lg:col-span-5 lg:justify-center lg:gap-6">
            {Object.entries(footerLinks).map(([category, links], i) => {
              const palette = LINK_NOTE_PALETTE[i % LINK_NOTE_PALETTE.length]
              return (
                <div key={category} className={`relative rounded-2xl border-2 border-ink-900 px-4 pt-4 pb-3 max-sm:px-3 max-sm:pt-2 max-sm:pb-1.5 shadow-paper sm:px-5 sm:pt-6 sm:pb-4 lg:px-6 lg:pt-8 lg:pb-5 ${palette.bg} ${palette.tilt}`}>
                  <StickerTape className="absolute -top-2.5 left-1/2 -translate-x-1/2" />
                  <h3 className="font-display text-ink-900 text-base font-bold max-sm:text-[13px] lg:text-xl">{category}</h3>
                  <ul className="mt-3 space-y-1 max-sm:mt-1.5 max-sm:space-y-0.5 lg:mt-3 lg:space-y-2">
                    {links.map((link) => (
                      <li key={link.href}>
                        <Link
                          to={link.href}
                          className="text-ink-900/80 hover:text-ink-900 -mx-1 inline-block rounded-md px-1 text-xs font-semibold transition-transform outline-none hover:translate-x-1 focus-visible:ring-2 focus-visible:ring-ink-900/60 max-sm:text-[11px] sm:text-sm lg:text-[15px]">
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </Reveal>
        </div>

        {/* Brand + sosial */}
        <div className="mt-8 border-t border-paper-white/10 pt-6 max-sm:mt-6 max-sm:pt-4 sm:mt-16 lg:mt-20 lg:pt-10">
          <div className="flex flex-col items-start justify-between gap-5 max-sm:gap-4 md:flex-row md:items-center md:gap-8">
            <div>
              <Link
                to="/"
                className="font-display text-brand-blue inline-block rounded-lg text-2xl font-bold tracking-tight outline-none transition hover:-translate-y-0.5 focus-visible:ring-3 focus-visible:ring-brand-blue/60 lg:text-3xl">
                DOSCOM University
              </Link>
              <p className="text-paper-white/60 mt-3 max-w-md text-sm leading-relaxed max-sm:mt-2">
                Program intensif open source DOSCOM — belajar ngoding bareng komunitas, dari nol sampai bisa ikut kontribusi.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon
                const isPlaceholder = social.href === '#'
                return isPlaceholder ? (
                  <span
                    key={social.label}
                    aria-disabled="true"
                    title={`${social.label} — segera hadir`}
                    className="grid size-10 cursor-not-allowed place-items-center rounded-full border-2 border-dashed border-paper-white/25 bg-paper-white/10 text-paper-white/40 lg:size-11"
                  >
                    <Icon className="size-5" />
                  </span>
                ) : (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="text-ink-900 hover:text-brand-blue shadow-button hover:shadow-button-hover grid size-10 place-items-center rounded-full border-2 border-ink-900 bg-paper-white outline-none transition hover:-translate-y-1 focus-visible:ring-3 focus-visible:ring-paper-white/80 lg:size-11">
                    <Icon className="size-5" />
                  </a>
                )
              })}
            </div>
          </div>

          <p className="text-paper-white/60 mt-3 text-center text-xs max-sm:mt-2 sm:mt-8 lg:mt-10">
            &copy; {new Date().getFullYear()} Doscom University · Dibuat dengan kertas, tinta, dan ngoding bareng.
          </p>
        </div>

        {/* Cap DOSCOM — tetap mengalir setelah copyright (bukan didorong ke dasar);
            ukuran teks lebih besar & tegas di mobile. */}
        <div aria-hidden className="pointer-events-none relative mt-3 mb-1 flex items-end justify-center overflow-hidden select-none max-sm:mb-0.5 lg:mb-2">
          <span className="font-display text-paper-white/20 text-[clamp(2.25rem,12vw,6rem)] leading-[0.8] font-bold tracking-tight whitespace-nowrap max-sm:text-[clamp(2.25rem,12vw,5rem)] md:text-[clamp(3.25rem,13vw,11rem)] lg:text-[clamp(3.5rem,14vw,13rem)]">
            DOSCOM
          </span>
        </div>
      </div>
    </footer>
  )
}
