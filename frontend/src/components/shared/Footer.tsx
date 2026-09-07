import { useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { footerLinks, socialLinks } from '../../lib/navigation'
import PenguinMascot from '../playful/PenguinMascot'
import { StickerTape } from '../playful/Stickers'

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
      <div className="mx-auto max-w-7xl px-4 pt-12 pb-8 sm:px-6 lg:px-8">
        {/* Buletin + chips: satu baris kompak di desktop */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Buletin ramping: teks kiri + form inline kanan */}
          <div className="relative max-w-xl rounded-3xl border-2 border-ink-900 bg-paper-white px-5 py-4 shadow-paper sm:px-6">
            <StickerTape className="absolute -top-2.5 left-6 -rotate-6" />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <div className="min-w-0">
                <p className="text-ink-500 text-[10px] font-extrabold tracking-[0.2em] uppercase">Buletin doscom</p>
                <h2 className="text-ink-900 font-display text-xl leading-tight font-bold tracking-tight sm:text-2xl">
                  Jangan sampai kelewat
                </h2>
              </div>
              <form onSubmit={handleSubscribe} className="flex w-full items-center gap-2 sm:max-w-xs">
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
                  className="bg-paper-white text-ink-900 placeholder:text-ink-400 min-w-0 flex-1 rounded-[10px] border-2 border-ink-900 px-3 py-2 h-auto"
                />
                <Button type="submit" className="shrink-0 rounded-[10px] px-4 py-2 h-auto">
                  Kirim
                </Button>
              </form>
            </div>
            <PenguinMascot className="pointer-events-none absolute -right-4 -bottom-4 hidden w-12 rotate-12 md:block" />
          </div>

          {/* Chips Jelajah / Mulai */}
          <div className="flex flex-col gap-3">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category} className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                <span className="text-paper-white/50 mr-1 text-[10px] font-extrabold tracking-[0.18em] uppercase">
                  {category}
                </span>
                {links.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="bg-paper-white text-ink-900 hover:text-brand-blue inline-flex items-center rounded-full border-2 border-ink-900 px-3 py-1 text-xs font-bold shadow-button transition outline-none hover:-translate-y-0.5 hover:shadow-button-hover focus-visible:ring-3 focus-visible:ring-brand-blue/60">
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Brand + sosial + copyright: satu baris rapat */}
        <div className="mt-8 flex flex-col gap-4 border-t border-paper-white/10 pt-5 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-baseline gap-3">
            <Link
              to="/"
              className="font-display text-brand-blue shrink-0 rounded-md text-xl font-bold tracking-tight outline-none transition hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-brand-blue/60">
              DOSCOM
            </Link>
            <p className="text-paper-white/50 hidden min-w-0 truncate text-xs leading-relaxed sm:block">
              Program intensif open source DOSCOM — belajar ngoding bareng komunitas.
            </p>
          </div>

          <div className="flex items-center justify-between gap-4 md:justify-end">
            <div className="flex flex-wrap items-center gap-2">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="text-ink-900 hover:text-brand-blue shadow-button hover:shadow-button-hover grid size-9 place-items-center rounded-full border-2 border-ink-900 bg-paper-white outline-none transition hover:-translate-y-0.5 focus-visible:ring-3 focus-visible:ring-paper-white/80">
                    <Icon className="size-4" />
                  </a>
                )
              })}
            </div>
            <p className="text-paper-white/40 text-[11px] whitespace-nowrap">
              &copy; {new Date().getFullYear()} Doscom
            </p>
          </div>
        </div>

        {/* Cap DOSCOM terpotong */}
        <div aria-hidden className="pointer-events-none relative mt-3 flex h-20 items-end justify-center overflow-hidden select-none">
          <span className="font-display text-paper-white/20 text-[clamp(4rem,16vw,15rem)] leading-[0.75] font-bold tracking-tight whitespace-nowrap">
            DOSCOM
          </span>
        </div>
      </div>
    </footer>
  )
}
