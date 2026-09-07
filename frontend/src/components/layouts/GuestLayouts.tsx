import type { ReactNode } from 'react'

import { useNavbarAuth } from '@/hooks/layout/use-navbar-auth'
import Footer from '../shared/Footer'
import Navbar from '../shared/Navbar'

const GuestLayout = ({ children }: { children: ReactNode }) => {
  const auth = useNavbarAuth()

  return (
    <>
      <Navbar auth={auth} />
      <div className="relative z-10 bg-background">{children}</div>
      <Footer />
    </>
  )
}

export default GuestLayout
