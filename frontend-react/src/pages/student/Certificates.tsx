import { AppSidebarProvider } from '@/components/shared/Sidebar'
import CertificatesSection from '@/components/student/CertificatesSection'
import { useSidebarUser } from '@/hooks/use-sidebar-user'

const Certificates = () => {
  const sidebarUser = useSidebarUser('student')

  return (
    <AppSidebarProvider role="student" user={sidebarUser}>
      <CertificatesSection />
    </AppSidebarProvider>
  )
}

export default Certificates
