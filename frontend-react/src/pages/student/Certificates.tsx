import { StudentSidebarProvider } from '@/components/shared/Sidebar'
import CertificatesSection from '@/components/student/CertificatesSection'

const Certificates = () => {
  return (
    <StudentSidebarProvider>
      <CertificatesSection />
    </StudentSidebarProvider>
  )
}

export default Certificates
