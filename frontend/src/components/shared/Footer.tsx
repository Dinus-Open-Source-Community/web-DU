import { useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { footerLinks, socialLinks } from '../../lib/navigation'

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
    <footer className="bg-ink-800 text-paper-white w-full">
      {/* Newsletter Section */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-5 md:px-6 lg:px-8">
        <div className="bg-paper-white text-ink-900 shadow-paper rounded-3xl border-2 border-ink-900 px-8 py-12 sm:px-12">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="text-center md:text-left">
              <h2 className="font-display text-ink-900 text-3xl font-bold tracking-tight sm:text-4xl">Subscribe to our newsletter</h2>
              <p className="text-ink-600 mt-2 text-lg">Be the first receive update, tips, and more.</p>
            </div>
            <form onSubmit={handleSubscribe} className="flex w-full max-w-md gap-3">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-paper-white text-ink-900 placeholder:text-ink-400 flex-1 rounded-[10px] border-2 border-ink-900 py-5 h-auto"
              />
              <Button type="submit" className="rounded-[10px] px-7 py-5 h-auto">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 pt-8 pb-12 sm:px-5 md:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-10 md:flex-row md:gap-16">
          {/* Brand Section */}
          <div className="shrink-0 md:max-w-xs">
            <Link to="/" className="font-display text-brand-blue text-2xl font-bold tracking-tight outline-none transition focus-visible:ring-3 focus-visible:ring-ring/30 rounded-lg">
              Doscom University
            </Link>
            <p className="text-paper-white/75 mt-4 leading-relaxed">Doscom University is one of DOSCOM&apos;s open source intensive training programs (bootcamps).</p>
            <div className="mt-6 flex gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" className="text-paper-white/80 transition hover:text-brand-blue focus-visible:ring-3 focus-visible:ring-ring/30 rounded-full outline-none" aria-label={social.label}>
                    <Icon className="h-6 w-6" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Footer Links */}
          <div className="grid grid-cols-2 gap-10 sm:gap-14 lg:gap-20">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category} className="shrink-0">
                <h3 className="text-paper-white text-sm font-bold tracking-wider uppercase">{category}</h3>
                <ul className="mt-4 space-y-3">
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link to={link.href} className="text-paper-white/70 hover:text-brand-blue text-sm transition rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/30">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 border-t border-paper-white/15 pt-8 text-center">
          <p className="text-paper-white/50 text-sm">&copy; {new Date().getFullYear()} Doscom University. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
