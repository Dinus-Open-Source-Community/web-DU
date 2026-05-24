import type { AdminMentor } from '../../lib/types/api'
import type { AdminStudent } from '../../lib/types/user'
import { MentorsTable } from '../../components/Admin/Mentors/Table'
import { PageHeader } from '../../components/shared/Header'
import { AdminSidebarProvider } from '../../components/shared/Sidebar'

export default function AdminMentorsPage() {
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
        <PageHeader title="Manajemen Mentor" subtitle="Daftar mentor beserta spesialisasi, performa kelas, dan rating siswa." />
        <MentorsTable dataMentors={dataMentors} dataStudents={studentData} />
      </div>
    </AdminSidebarProvider>
  )
}
