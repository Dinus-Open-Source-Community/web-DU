import { MentorSidebarProvider } from '@/components/shared/Sidebar'
import type { ICourseItem } from '@/lib/types/api'
import ManageCourseSection from '../../components/shared/ManageCourse'

export default function MentorCoursesPage() {
  const dataCourses: ICourseItem[] = [
    {
      uid: 'course-001',
      category_uid: 'cat-frontend',
      course_type_uid: 'type-online',
      cover_url: 'https://picsum.photos/seed/course-001/1200/600',
      created_at: '2024-01-10T08:30:00Z',
      description: 'Belajar dasar React dan membuat komponen UI modern dengan TypeScript.',
      event_uid: null,
      is_premium: true,
      is_published: true,
      level: 'beginner',
      mentor_uid: 'mentor-001',
      mentors: [],
      price: 299000,
      price_strike: 499000,
      slot: 100,
      slug: 'react-fundamentals',
      status: 'active',
      subtitle: 'Mulai dari nol hingga siap bikin project',
      thumbnail_url: 'https://picsum.photos/seed/course-001/400/250',
      title: 'React Fundamentals',
      updated_at: '2024-02-01T10:00:00Z',
      what_you_learn: ['JSX dan komponen', 'Props dan state', 'Hooks dasar'],
    },
    {
      uid: 'course-002',
      category_uid: 'cat-backend',
      course_type_uid: 'type-online',
      cover_url: 'https://picsum.photos/seed/course-002/1200/600',
      created_at: '2024-01-15T09:00:00Z',
      description: 'Bangun REST API dengan Node.js dan Express, lengkap dengan autentikasi.',
      event_uid: null,
      is_premium: false,
      is_published: true,
      level: 'intermediate',
      mentor_uid: 'mentor-002',
      mentors: [],
      price: 0,
      price_strike: 199000,
      slot: 250,
      slug: 'nodejs-rest-api',
      status: 'active',
      subtitle: 'Dari setup hingga deployment',
      thumbnail_url: 'https://picsum.photos/seed/course-002/400/250',
      title: 'Node.js REST API',
      updated_at: '2024-02-05T12:00:00Z',
      what_you_learn: ['Routing dan middleware', 'Validasi dan error handling', 'JWT authentication'],
    },
  ]
  return (
    <MentorSidebarProvider>
      <ManageCourseSection role="mentor" data={{ courses: dataCourses, meta: { page: 1, per_page: 10, total: 2, total_pages: 1 } }} />
    </MentorSidebarProvider>
  )
}
