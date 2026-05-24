import { StatCard } from '@/components/shared/StatCard'
import { StudentSidebarProvider } from '../../components/shared/Sidebar'
import { Calendar, MessageSquare, PlayCircle } from 'lucide-react'
import ResumeCard from '@/components/shared/ResumeCard'
import type { IUserData } from '@/lib/types/user'
import FeedbackCard from '@/components/shared/Feedback'

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

  const iconMap: Record<string, typeof PlayCircle | typeof MessageSquare | typeof Calendar> = {
    Aktif: PlayCircle,
    Selesai: MessageSquare,
    Pending: Calendar,
  }
  const joinedCourses = (Data?.joined_courses as { uid: string; title: string; progress?: number; image?: string; module?: string }[]) ?? []
  const resumeCourses = joinedCourses.filter((course) => course.progress !== undefined && course.progress < 100 && course.progress > 0)

  return (
    <StudentSidebarProvider>
      <section className="px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <div className="mb-10">
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">Halo, {Data.name} 👋</h1>
          <p className="mt-1 text-on-surface-variant">Siap untuk melanjutkan perjalanan belajarmu hari ini?</p>
        </div>

        <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Data?.enrollment_summary ? (
            Object.entries(Data.enrollment_summary).map(([label, value]) => {
              const Icon = iconMap[label]
              return <StatCard key={label} variant="compact" label={label} value={value} icon={Icon ? <Icon className="h-5 w-5" /> : undefined} />
            })
          ) : (
            <div className="col-span-full rounded-xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500">Belum ada ringkasan data dashboard.</div>
          )}
        </div>

        <div className="mb-10">
          <h2 className="font-headline mb-6 flex items-center gap-2 text-xl font-bold">
            <PlayCircle className="text-primary" size={24} />
            Lanjutkan Belajar
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {resumeCourses.length > 0 ? (
              resumeCourses.map((course) => <ResumeCard key={course.uid} data={{ ...course, progress: course.progress ?? 0 }} />)
            ) : (
              <div className="col-span-full rounded-xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500">Belum ada kursus untuk dilanjutkan.</div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-headline flex items-center gap-2 text-xl font-bold">
                <Calendar className="text-error" size={24} />
                Tenggat Waktu
              </h2>
            </div>
            <div className="space-y-4">
              <div className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500">Tidak ada tenggat waktu saat ini.</div>
            </div>
          </div>

          <div>
            <h2 className="font-headline mb-6 flex items-center gap-2 text-xl font-bold">
              <MessageSquare className="text-secondary" size={24} />
              Umpan Balik
            </h2>
            <div className="space-y-4">
              {((Data?.course_reviews as { status?: string; time?: string; title?: string; comment?: string; instructor?: { name: string; avatar: string } }[]) ?? []).length > 0 ? (
                (Data?.course_reviews as { status: 'Lulus' | 'Perlu Revisi'; time: string; title: string; comment: string; instructor: { name: string; avatar: string } }[])
                  .slice(0, 3)
                  .map((fb, i) => <FeedbackCard key={i} status={fb.status} time={fb.time} title={fb.title} comment={fb.comment} instructor={fb.instructor} />)
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500">Belum ada umpan balik terbaru.</div>
              )}
            </div>
          </div>
        </div>
      </section>
    </StudentSidebarProvider>
  )
}
