import { AppSidebarProvider } from '../../components/shared/Sidebar'
import { CourseEditClient } from '../../components/courses/(authorized)/editCourse'
import { useParams, useSearchParams } from 'react-router-dom'
import type { CourseDetailItem } from '@/lib/types/api'

const CourseEdit = () => {
  const { uid } = useParams()
  console.log('Course UID from URL:', uid) // Debugging line to check if UID is captured correctly
  const [searchParams] = useSearchParams()
  const moduleId = searchParams.get('moduleId') ?? undefined

  const courseData: CourseDetailItem = {
    category: {
      created_at: '2026-05-12T19:06:39.048745Z',
      description: 'Kategori untuk course pengembangan web',
      is_active: true,
      name: 'Web Development',
      uid: '83676583',
      updated_at: '2026-05-12T19:06:39.048745Z',
    },
    course_type: {
      created_at: '2026-05-12T19:06:39.056161Z',
      description: 'Kelas intensif dengan project',
      is_active: true,
      name: 'Bootcamp',
      uid: '949923d1',
      updated_at: '2026-05-12T19:06:39.056161Z',
    },
    cover_url: 'https://via.placeholder.com/400x300?text=DevOps',
    created_at: '2026-05-12T19:06:39.074659Z',
    description: 'Pelajari deployment, Docker, dan CI/CD pipeline untuk production',
    event_uid: null,
    is_premium: true,
    is_published: true,
    level: 'LANJUTAN',
    mentors: [
      {
        avatar_url: 'https://via.placeholder.com/150?text=Dimas',
        created_at: '2026-05-12T19:06:38.996285Z',
        description: 'Mentor DevOps dan cloud deployment',
        email: 'dimas.mentor@doscom.id',
        is_verified: true,
        name: 'Dimas Saputra',
        role: 'mentor',
        uid: '2f49d823',
        updated_at: '2026-05-12T19:36:49.442267Z',
      },
    ],
    modules: [
      {
        course_uid: '6f43bd95',
        created_at: '2026-05-12T19:06:39.108838Z',
        lessons: [
          {
            created_at: '2026-05-12T19:06:39.200634Z',
            module_uid: '38ae27a2',
            order_index: 1,
            title: 'Pengenalan Docker',
            uid: 'd23601da',
            updated_at: '2026-05-12T19:06:39.200634Z',
          },
          {
            created_at: '2026-05-12T19:06:39.203752Z',
            module_uid: '38ae27a2',
            order_index: 2,
            title: 'Membuat Dockerfile',
            uid: '8ca72ea1',
            updated_at: '2026-05-12T19:06:39.203752Z',
          },
          {
            created_at: '2026-05-12T19:06:39.207852Z',
            module_uid: '38ae27a2',
            order_index: 3,
            title: 'Docker Compose Dasar',
            uid: '6ed755d4',
            updated_at: '2026-05-12T19:06:39.207852Z',
          },
        ],
        order_index: 1,
        title: 'Docker Fundamentals',
        uid: '38ae27a2',
      },
      {
        course_uid: '6f43bd95',
        created_at: '2026-05-12T19:06:39.111355Z',
        lessons: [
          {
            created_at: '2026-05-12T19:06:39.211129Z',
            module_uid: '129f691c',
            order_index: 1,
            title: 'Konsep CI/CD',
            uid: 'ca91192d',
            updated_at: '2026-05-12T19:06:39.211129Z',
          },
          {
            created_at: '2026-05-12T19:06:39.213454Z',
            module_uid: '129f691c',
            order_index: 2,
            title: 'Setup Pipeline Otomatis',
            uid: 'ae1fdd9b',
            updated_at: '2026-05-12T19:06:39.213454Z',
          },
        ],
        order_index: 2,
        title: 'CI/CD Pipeline',
        uid: '129f691c',
      },
      {
        course_uid: '6f43bd95',
        created_at: '2026-05-12T19:06:39.113729Z',
        lessons: [
          {
            created_at: '2026-05-12T19:06:39.215637Z',
            module_uid: 'a7759a81',
            order_index: 1,
            title: 'Arsitektur Kubernetes',
            uid: 'f41d335b',
            updated_at: '2026-05-12T19:06:39.215637Z',
          },
          {
            created_at: '2026-05-12T19:06:39.218225Z',
            module_uid: 'a7759a81',
            order_index: 2,
            title: 'Deploy Aplikasi ke Cluster',
            uid: '6720d9bb',
            updated_at: '2026-05-12T19:06:39.218225Z',
          },
        ],
        order_index: 3,
        title: 'Kubernetes Basics',
        uid: 'a7759a81',
      },
    ],
    price: 329000,
    price_strike: 429000,
    slot: 20,
    slug: 'devops-essentials',
    status: 'DRAFT',
    subtitle: 'Deploy aplikasi dengan pipeline modern',
    thumbnail_url: 'https://via.placeholder.com/400x300?text=DevOps',
    title: 'DevOps Essentials',
    uid: '6f43bd95',
    updated_at: '2026-05-12T19:06:39.074659Z',
    what_you_learn: ['Pengenalan konsep utama', 'Studi kasus dunia nyata'],
  }

  return (
    <AppSidebarProvider role="admin" user={{ name: 'Admin', email: 'admin@doscom.id' }}>
      <CourseEditClient courseData={courseData} initialModuleId={moduleId} role="admin" />
    </AppSidebarProvider>
  )
}

export default CourseEdit
