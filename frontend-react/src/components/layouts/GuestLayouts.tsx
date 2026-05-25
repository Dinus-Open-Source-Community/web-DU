import Footer from '../shared/Footer';
import Navbar from '../shared/Navbar';

const GuestLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  )
}

export default GuestLayout
