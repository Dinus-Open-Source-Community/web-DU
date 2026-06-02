import { AppSidebarProvider } from '../../components/shared/Sidebar'
import ManageCourseSection from '../../components/shared/ManageCourse'
import type { CourseListResponse } from '../../lib/types/api'

const Courses = () => {
  const data: CourseListResponse = {
    courses: [
      {
        category_uid: '08b83da0-9e18-45ee-8787-6d713656d062',
        course_type_uid: '24c740e6-4b69-481a-b5f5-0098df3184af',
        cover_url: 'https://via.placeholder.com/400x300?text=DevOps',
        created_at: '2026-05-05T16:20:56.074414Z',
        description: 'Pelajari deployment, Docker, dan CI/CD pipeline untuk production',
        event_uid: null,
        is_premium: true,
        is_published: true,
        level: 'LANJUTAN',
        mentor_uid: '2bc246fb-0b43-4711-a139-580a00262660',
        mentors: [
          {
            avatar_url: 'https://via.placeholder.com/150?text=Nadia',
            created_at: '2026-05-05T16:20:56.032827Z',
            description: 'Mentor database dan data engineering',
            email: 'nadia.mentor@doscom.id',
            is_verified: true,
            name: 'Nadia Putri',
            role: 'mentor',
            uid: '2bc246fb-0b43-4711-a139-580a00262660',
            updated_at: '2026-05-06T08:50:11.515349Z',
          },
        ],
        price: 329000,
        price_strike: 429000,
        slot: 20,
        slug: 'devops-essentials',
        status: 'DRAFT',
        subtitle: 'Deploy aplikasi dengan pipeline modern',
        thumbnail_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
        title: 'DevOps Essentials',
        uid: '270a24ce-95dd-48ba-90e5-f14b07a2d99b',
        updated_at: '2026-05-05T16:20:56.074414Z',
        what_you_learn: ['Pengenalan konsep utama', 'Studi kasus dunia nyata'],
      },
    ],
    meta: { current_page: 1, per_page: 6, total: 0, total_pages: 0 },
  }
  return (
    <AppSidebarProvider role="admin" user={{ name: 'Admin', email: 'admin@doscom.id' }}>
      <ManageCourseSection role="admin" data={data} />
    </AppSidebarProvider>
  )
}

export default Courses
