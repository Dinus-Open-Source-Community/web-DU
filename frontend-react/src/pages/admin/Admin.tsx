import type { AdminAdministrator, AdminMentor } from '../../lib/types/api'
import type { AdminStudent } from '../../lib/types/user'
import { AdministratorsTable } from '../../components/Admin/Administrators/table'
import { PageHeader } from '../../components/shared/Header'
import { AdminSidebarProvider } from '../../components/shared/Sidebar'

export default function AdminAdministratorsPage() {
  const dataAdmin: AdminAdministrator[] = [
    {
      uid: 'admin-001',
      name: 'Siti Aminah',
      email: 'siti.aminah@example.com',
      avatar: 'https://i.pravatar.cc/150?img=3',
      role: 'Super Admin',
      lastActive: '2024-06-01T12:00:00Z',
      status: 'active',
      createdAt: '2023-01-10T09:00:00Z',
    },
  ]
  const dataMentors: AdminMentor[] = [
    {
      uid: 'mentor-001',
      name: 'Budi Santoso',
      email: 'budi.santoso@example.com',
      avatar: 'https://i.pravatar.cc/150?img=2',
      joinedAt: '2023-01-15',
      totalCourses: 5,
      rating: 4.8,
      totalReviews: 20,
      status: 'active',
      studentsCount: 150,
    },
  ]

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
    <AdminSidebarProvider>
      <div className="flex flex-col gap-6">
        <PageHeader title="Administrator Platform" subtitle="Daftar staf internal dengan akses panel admin. Kelola role dan kredensial mereka." />
        <AdministratorsTable dataAdmin={dataAdmin} dataMentors={dataMentors} dataStudents={studentData} />
      </div>
    </AdminSidebarProvider>
  )
}
