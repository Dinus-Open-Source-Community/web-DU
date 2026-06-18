import { useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { footerLinks, socialLinks } from '../../lib/navigation'

export default function Footer() {
  const [email, setEmail] = useState('')
  const { pathname } = useLocation()

  const isFooterHidden = (pathname?.startsWith('/course/') && pathname !== '/course') || pathname.startsWith('/checkout/')

  const handleSubscribe = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log('Subscribing email:', email)
    setEmail('')
  }

  if (isFooterHidden) {
    return null
  }

  return (
    <footer className="bg-secondary-foreground text-popover w-full">
      {/* Newsletter Section */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-5 lg:px-6 xl:px-8">
        <div className="bg-card rounded-xl border border-blue-500/20 px-8 py-12 backdrop-blur-sm sm:px-12">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="text-center md:text-left">
              <h2 className="text-primary text-3xl font-bold sm:text-4xl">Subscribe to our newsletter</h2>
              <p className="text-primary/80 mt-2 text-lg">Be the first receive update, tips, and more.</p>
            </div>
            <form onSubmit={handleSubscribe} className="flex w-full max-w-md gap-3">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-popover/5 text-secondary-foreground flex-1 rounded-md border-2 border-gray-300 py-5 placeholder:text-gray-700/40"
              />
              <Button type="submit" className="bg-primary rounded-md px-7 py-5 text-white">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 pt-8 pb-12 sm:px-5 lg:px-6 xl:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          {/* Brand Section */}
          <div className="shrink-0 md:max-w-xs">
            <Link to="/" className="text-primary text-2xl font-bold">
              Doscom University
            </Link>
            <p className="text-popover/80 mt-4 leading-relaxed">Doscom University is one of DOSCOM&apos;s open source intensive training programs (bootcamps).</p>
            <div className="mt-6 flex gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" className="text-popover transition-colors hover:text-primary" aria-label={social.label}>
                    <Icon className="h-6 w-6" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Footer Links */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:gap-12 lg:gap-16">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category} className="shrink-0">
                <h3 className="text-sm font-semibold tracking-wider text-white uppercase">{category}</h3>
                <ul className="mt-4 space-y-3">
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link to={link.href} className="text-popover/70 hover:text-primary text-sm transition">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 border-t border-popover/10 pt-8 text-center">
          <p className="text-popover/50 text-sm">&copy; {new Date().getFullYear()} Doscom University. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
