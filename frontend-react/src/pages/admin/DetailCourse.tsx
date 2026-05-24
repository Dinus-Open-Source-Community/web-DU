import { useParams } from 'react-router-dom'
import { DetailCourse } from '../../components/shared/DetailCourseComponents'
import { AdminSidebarProvider } from '../../components/shared/Sidebar'
import type { CourseDetailItem } from '../../lib/types/api'
import type { IMentorCourseStudent } from '../../lib/types/course'

export default function AdminCourseDetailPage() {
  const { uid } = useParams()
  const dataCourse: CourseDetailItem[] = [
    {
      category: {} as CourseDetailItem['category'],
      course_type: {} as CourseDetailItem['course_type'],
      cover_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200',
      created_at: '2025-01-01T08:00:00.000Z',
      description: 'Kursus pengantar pengembangan web modern untuk pemula hingga menengah.',
      event_uid: null,
      is_premium: true,
      is_published: true,
      level: 'Beginner',
      mentors: [
        {
          avatar_url: 'https://i.pravatar.cc/150?img=12',
          created_at: '2025-01-01T08:00:00.000Z',
          description: 'Mentor full-stack dengan pengalaman industri 5+ tahun.',
          email: 'mentor@example.com',
          is_verified: true,
          name: 'Rahmat Hidayat',
          role: 'Mentor',
          uid: 'mentor-001',
          updated_at: '2025-01-10T10:30:00.000Z',
        },
      ],
      modules: [
        {
          course_uid: 'course-001',
          created_at: '2025-01-01T08:00:00.000Z',
          lessons: [
            {
              title: 'Pengenalan HTML',
              created_at: '2025-01-01T08:15:00.000Z',
              module_uid: 'module-001',
              order_index: 1,
              uid: 'lesson-001',
              updated_at: '2025-01-01T09:00:00.000Z',
            },
            {
              title: 'Membuat Komponen Web',
              created_at: '2025-01-01T08:30:00.000Z',
              module_uid: 'module-001',
              order_index: 2,
              uid: 'lesson-002',
              updated_at: '2025-01-01T09:15:00.000Z',
            },
          ],
          order_index: 1,
          title: 'Pengenalan Dasar',
          uid: 'module-001',
        },
      ],
      price: 250000,
      price_strike: 350000,
      slot: 30,
      slug: 'pengembangan-web-modern',
      status: 'active',
      subtitle: 'Belajar membangun aplikasi web dari nol.',
      thumbnail_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
      title: 'Web Development Fundamentals',
      uid: 'course-001',
      updated_at: '2025-01-10T10:30:00.000Z',
      what_you_learn: ['Memahami dasar HTML, CSS, dan JavaScript', 'Membuat komponen web yang responsif', 'Membangun aplikasi sederhana dengan praktik terbaik'],
    },
  ]
  const dataStudents: IMentorCourseStudent[] = [
    {
      uid: 'stu-mc001-1',
      name: 'Aditya Pratama',
      email: '',
      progressPercent: 92,
      attendancePresent: 11,
      attendanceTotal: 12,
      status: 'Aktif',
      lastActiveLabel: '2 jam lalu',
    },
    {
      uid: 'stu-mc001-2',
      name: 'Siti Nurhaliza',
      email: '',
      progressPercent: 78,
      attendancePresent: 9,
      attendanceTotal: 12,
      status: 'Aktif',
      lastActiveLabel: 'Kemarin',
    },
    {
      uid: 'stu-mc001-3',
      name: 'Budi Santoso',
      email: '',
      progressPercent: 100,
      attendancePresent: 12,
      attendanceTotal: 12,
      status: 'Selesai',
      lastActiveLabel: '3 hari lalu',
    },
  ]
  return (
    <AdminSidebarProvider>
      <DetailCourse courseUid={uid as string} role="admin" dataCourse={dataCourse} dataStudents={dataStudents} />
    </AdminSidebarProvider>
  )
}
