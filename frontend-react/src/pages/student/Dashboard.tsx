import DashboardSection from '@/components/student/DashboardSection'
import { StudentSidebarProvider } from '../../components/shared/Sidebar'

import type { IUserData } from '@/lib/types/user'

export default function StudentDashboard() {
  const Data: IUserData = {
    avatar_url: 'https://via.placeholder.com/150?text=Budi',
    course_reviews: [],
    created_at: '2026-05-12T19:06:38.797277Z',
    description: 'Mahasiswa Dinus yang aktif belajar',
    email: 'budi@doscom.id',
    enrollment_invoices: [
      {
        course: {
          cover_url: 'https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=400&h=300&fit=crop',
          is_premium: true,
          is_published: true,
          level: 'MENENGAH',
          price: 299000,
          price_strike: 379000,
          slug: 'rest-api-development',
          status: 'DRAFT',
          subtitle: 'Bangun API robust dan aman',
          thumbnail_url: 'https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=400&h=300&fit=crop',
          title: 'REST API Development',
          uid: 'eca32b12',
        },
        course_uid: 'eca32b12',
        enrolled_at: '2026-05-23T09:05:55.19783Z',
        enrollment_status: 'pending',
        enrollment_uid: '15761328',
        progress: 0,
        user_uid: '304eca1b',
      },
    ],
    enrollment_summary: {
      active: 0,
      cancelled: 0,
      completed: 0,
      pending: 1,
      total: 1,
    },
    is_verified: true,
    joined_courses: [
      {
        cover_url: 'https://via.placeholder.com/400x300?text=RestAPI',
        enrolled_at: '2026-05-23T09:05:55.19783Z',
        enrollment_status: 'pending',
        is_premium: true,
        is_published: true,
        level: 'MENENGAH',
        price: 299000,
        progress: 0,
        slug: 'rest-api-development',
        status: 'DRAFT',
        subtitle: 'Bangun API robust dan aman',
        thumbnail_url: 'https://via.placeholder.com/400x300?text=RestAPI',
        title: 'REST API Development',
        uid: 'eca32b12',
      },
    ],
    mentored_courses: [],
    name: 'Budi Santoso',
    review_summary: {
      average_rating: 0,
      total_reviews: 0,
    },
    role: 'student',
    transaction_history: [],
    uid: '304eca1b',
    updated_at: '2026-05-23T07:57:42.171252Z',
  }

  return (
    <StudentSidebarProvider>
      <DashboardSection Data={Data} />
    </StudentSidebarProvider>
  )
}
