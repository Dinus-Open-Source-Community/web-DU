import type { AdminStudent } from '../../lib/types/user'
import { TableManagementUsers } from '../../components/Admin/Student/Table'
import { PageHeader } from '../../components/shared/Header'
import { AppSidebarProvider } from '../../components/shared/Sidebar'

export default function AdminStudentsPage() {
  const studentData: AdminStudent[] = [
    {
      uid: 's12345',
      name: 'Budi Santoso',
      email: 'test@mail.com',
      averageProgress: 75,
      status: 'active',
      avatar: 'https://i.pravatar.cc/150?img=1',
      joinedAt: '2023-01-15T10:00:00Z',
      enrolledCourses: 5,
      totalSpent: 1500000,
      phone: '081234567890',
      lastActive: '2024-06-01T12:00:00Z',
    },
  ]
  return (
    <AppSidebarProvider role="admin" user={{ name: 'Admin', email: 'admin@doscom.id' }}>
      <PageHeader title="Manajemen Siswa" subtitle="Daftar siswa terdaftar, progres belajar, dan kredensial akun." />
      <TableManagementUsers studentData={studentData} />
    </AppSidebarProvider>
  )
}
