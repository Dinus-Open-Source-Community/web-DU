import type { ReactNode } from 'react'

import { useNavbarAuth } from '@/hooks/layout/use-navbar-auth'
import Footer from '../shared/Footer'
import Navbar from '../shared/Navbar'

const GuestLayout = ({ children }: { children: ReactNode }) => {
  const auth = useNavbarAuth()

  return (
    <>
      <Navbar auth={auth} />
      {children}
      <Footer />
    </>
  )
}

export default GuestLayout
