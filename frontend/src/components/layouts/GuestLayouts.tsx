import type { ReactNode } from 'react'

import { useNavbarAuth } from '@/hooks/layout/use-navbar-auth'
import { landingSurfaceClassName } from '@/lib/landing/landing-surface'
import { cn } from '@/lib/utils'
import Footer from '../shared/Footer'
import Navbar from '../shared/Navbar'

type GuestLayoutProps = {
  children: ReactNode
  /** Kontrol CTA auth di navbar guest (landing pakai Daftar + Masuk). */
  navbarAuthVariant?: 'default' | 'home'
  /** Beranda marketing: palet terang tetap meski tema app gelap. */
  marketingSurface?: boolean
}

const GuestLayout = ({
  children,
  navbarAuthVariant = 'default',
  marketingSurface = false,
}: GuestLayoutProps) => {
  const auth = useNavbarAuth()

  const shellClass = cn(marketingSurface && `${landingSurfaceClassName} min-h-dvh`)

  return (
    <div className={shellClass}>
      <a
        href="#main-content"
        className="bg-ink-900 text-paper-white focus-visible:ring-brand-blue/60 fixed top-2 left-2 z-[100] -translate-y-24 rounded-lg px-4 py-2 text-sm font-bold shadow-button focus:translate-y-0"
      >
        Langsung ke konten
      </a>
      <Navbar auth={auth} authActionsVariant={navbarAuthVariant} />
      <div
        id="main-content"
        className={cn('relative z-10', marketingSurface ? 'bg-transparent' : 'bg-background')}
      >
        {children}
      </div>
      <Footer />
    </div>
  )
}

export default GuestLayout
