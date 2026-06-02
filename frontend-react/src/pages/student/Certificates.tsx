import { AppSidebarProvider } from '@/components/shared/Sidebar'
import CertificatesSection from '@/components/student/CertificatesSection'

const Certificates = () => {
  return (
    <AppSidebarProvider role="student" user={{ name: 'Student', email: 'student@doscom.id' }}>
      <CertificatesSection />
    </AppSidebarProvider>
  )
}

export default Certificates
