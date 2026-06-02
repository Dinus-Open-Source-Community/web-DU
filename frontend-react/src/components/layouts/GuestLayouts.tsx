import type { ReactNode } from 'react'
import Footer from '../shared/Footer';
import Navbar from '../shared/Navbar';

const GuestLayout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  )
}

export default GuestLayout
