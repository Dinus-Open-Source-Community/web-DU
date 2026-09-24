import type { ReactNode } from 'react'

import { useNavbarAuth } from '@/hooks/layout/use-navbar-auth'
import Footer from '../shared/Footer'
import Navbar from '../shared/Navbar'

const GuestLayout = ({ children }: { children: ReactNode }) => {
  const auth = useNavbarAuth()

  return (
    <>
      <a
        href="#main-content"
        className="bg-ink-900 text-paper-white focus-visible:ring-brand-blue/60 fixed top-2 left-2 z-[100] -translate-y-24 rounded-lg px-4 py-2 text-sm font-bold shadow-button focus:translate-y-0"
      >
        Langsung ke konten
      </a>
      <Navbar auth={auth} />
      <div id="main-content" className="relative z-10 bg-background">
        {children}
      </div>
      <Footer />
    </>
  )
}

export default GuestLayout
