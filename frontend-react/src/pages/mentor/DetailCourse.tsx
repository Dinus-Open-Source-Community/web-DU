import { useParams } from 'react-router-dom'

import { DetailCourse } from '../../components/shared/DetailCourseComponents'
import { AppSidebarProvider } from '../../components/shared/Sidebar'
import { useCourseDetailManageView } from '@/hooks/course-detail/use-course-detail-manage-view'
import { buildLessonResponseStub } from '@/lib/fixtures/lesson-response'
import type { ICourseDetailItem, IMentorCourseStudent } from '@/lib/types/course'
import { useSidebarUser } from '@/hooks/use-sidebar-user'

export default function MentorCourseDetailPage() {
  const sidebarUser = useSidebarUser('mentor')
  const { uid } = useParams()
  const dataCourse: ICourseDetailItem[] = [
    {
      category: {} as ICourseDetailItem['category'],
      course_type: {} as ICourseDetailItem['course_type'],
      cover_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200',
      created_at: '2025-01-01T08:00:00.000Z',
      created_by: {
        avatar_url: 'https://i.pravatar.cc/150?img=12',
        is_verified: true,
        name: 'Rahmat Hidayat',
        role: 'mentor',
        uid: 'mentor-001',
      },
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
            buildLessonResponseStub({
              title: 'Pengenalan HTML',
              created_at: '2025-01-01T08:15:00.000Z',
              module_uid: 'module-001',
              order_index: 1,
              uid: 'lesson-001',
              updated_at: '2025-01-01T09:00:00.000Z',
            }),
            buildLessonResponseStub({
              title: 'Membuat Komponen Web',
              created_at: '2025-01-01T08:30:00.000Z',
              module_uid: 'module-001',
              order_index: 2,
              uid: 'lesson-002',
              updated_at: '2025-01-01T09:15:00.000Z',
            }),
          ],
          order_index: 1,
          title: 'Pengenalan Dasar',
          uid: 'module-001',
        },
      ],
      price: 250000,
      price_strike: 350000,
      rating: 4.8,
      reviews: [],
      slot: 30,
      total_reviews: 24,
      slug: 'pengembangan-web-modern',
      status: 'active',
      subtitle: 'Belajar membangun aplikasi web dari nol.',
      thumbnail_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
      title: 'Web Development Fundamentals',
      uid: 'course-001',
      updated_at: '2025-01-10T10:30:00.000Z',
      what_you_learn: [
        'Memahami dasar HTML, CSS, dan JavaScript',
        'Membuat komponen web yang responsif',
        'Membangun aplikasi sederhana dengan praktik terbaik',
      ],
    },
  ]

  const dataStudents: IMentorCourseStudent[] = [
    {
      enrollment_uid: 'enr-mc001-1',
      student_uid: 'stu-mc001-1',
      student_name: 'Aditya Pratama',
      student_avatar_url: '',
      enrolled_at: '2025-01-02T08:00:00.000Z',
      progress: 92,
      status: 'Aktif',
      student_attendance_present: 11,
      student_attendance_total: 12,
    },
    {
      enrollment_uid: 'enr-mc001-2',
      student_uid: 'stu-mc001-2',
      student_name: 'Siti Nurhaliza',
      student_avatar_url: '',
      enrolled_at: '2025-01-03T08:00:00.000Z',
      progress: 78,
      status: 'Aktif',
      student_attendance_present: 9,
      student_attendance_total: 12,
    },
    {
      enrollment_uid: 'enr-mc001-3',
      student_uid: 'stu-mc001-3',
      student_name: 'Budi Santoso',
      student_avatar_url: '',
      enrolled_at: '2025-01-04T08:00:00.000Z',
      progress: 100,
      status: 'Selesai',
      student_attendance_present: 12,
      student_attendance_total: 12,
    },
  ]

  return (
    <AppSidebarProvider role="mentor" user={sidebarUser}>
      <MentorCourseDetailContent
        courseUid={uid as string}
        dataCourse={dataCourse}
        dataStudents={dataStudents}
      />
    </AppSidebarProvider>
  )
}

type MentorCourseDetailContentProps = {
  courseUid: string
  dataCourse: ICourseDetailItem[]
  dataStudents: IMentorCourseStudent[]
}

function MentorCourseDetailContent({
  courseUid,
  dataCourse,
  dataStudents,
}: MentorCourseDetailContentProps) {
  const view = useCourseDetailManageView({
    courseUid,
    role: 'mentor',
    dataCourse,
    dataStudents,
  })

  if (!view) return null

  return <DetailCourse view={view} />
}
