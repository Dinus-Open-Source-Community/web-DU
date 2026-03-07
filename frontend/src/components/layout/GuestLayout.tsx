import Footer from '../Footer'
import Navbar from '../Navbar'

const GuestLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    < >
      <Navbar />
      {children}
      <Footer />
    </>
  )
}

export default GuestLayout
