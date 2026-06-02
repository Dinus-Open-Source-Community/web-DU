import { ReviewsQaTabs } from '@/components/Admin/QA/ReviewsTabs'
import { PageHeader } from '@/components/shared/Header'
import { AppSidebarProvider } from '@/components/shared/Sidebar'
import type { AdminQaThread, AdminReview } from '@/lib/types/course'
import { useSearchParams } from 'react-router-dom'

export default function AdminReviewsQaPage() {
  const [searchParams] = useSearchParams()
  const courseUid = searchParams.get('courseUid') || 'course-001'
  const dataAdminReviews: AdminReview[] = [
    {
      uid: 'review-001',
      courseUid: 'course-001',
      studentUid: 'student-001',
      courseTitle: 'Dasar Pemrograman Web',
      studentName: 'Nadia Putri',
      studentAvatar: 'https://i.pravatar.cc/100?img=12',
      rating: 5,
      comment: 'Materinya jelas dan mudah diikuti. Latihannya membantu.',
      createdAt: '2024-11-18T09:15:00Z',
      reply: {
        author: 'Admin',
        comment: 'Terima kasih atas ulasannya! Senang membantu.',
        createdAt: '2024-11-18T10:00:00Z',
      },
    },
    {
      uid: 'review-002',
      courseUid: 'course-002',
      studentUid: 'student-002',
      courseTitle: 'React untuk Pemula',
      studentName: 'Rafi Mahendra',
      studentAvatar: 'https://i.pravatar.cc/100?img=32',
      rating: 4,
      comment: 'Bagus, tapi beberapa topik perlu contoh tambahan.',
      createdAt: '2024-11-20T14:30:00Z',
    },
    {
      uid: 'review-003',
      courseUid: 'course-003',
      studentUid: 'student-003',
      courseTitle: 'Fundamental UI/UX',
      studentName: 'Salsa Aulia',
      studentAvatar: 'https://i.pravatar.cc/100?img=48',
      rating: 5,
      comment: 'Penjelasannya runtut dan studi kasusnya relevan.',
      createdAt: '2024-11-22T08:05:00Z',
      reply: {
        author: 'Admin',
        comment: 'Terima kasih, semoga bermanfaat!',
        createdAt: '2024-11-22T09:10:00Z',
      },
    },
  ]
  const dataAdminQaThreads: AdminQaThread[] = [
    {
      uid: 'qa-001',
      courseUid: 'course-001',
      authorUid: 'student-004',
      courseTitle: 'Dasar Pemrograman Web',
      title: 'Bagaimana cara submit tugas?',
      author: 'Dito Pratama',
      authorAvatar: 'https://i.pravatar.cc/100?img=15',
      body: 'Saya sudah mengerjakan, tapi tidak menemukan tombol submit. Di mana letaknya?',
      createdAt: '2024-11-19T07:20:00Z',
      repliesCount: 1,
      status: 'answered',
      replies: [
        {
          uid: 'qa-reply-001',
          author: 'Admin',
          authorAvatar: 'https://i.pravatar.cc/100?img=1',
          role: 'admin',
          body: 'Tombol submit ada di akhir halaman tugas. Scroll sampai bagian bawah ya.',
          createdAt: '2024-11-19T08:00:00Z',
        },
      ],
    },
    {
      uid: 'qa-002',
      courseUid: 'course-002',
      authorUid: 'student-005',
      courseTitle: 'React untuk Pemula',
      title: 'Apa beda state dan props?',
      author: 'Nina Khairani',
      authorAvatar: 'https://i.pravatar.cc/100?img=22',
      body: 'Masih bingung kapan pakai state dan kapan pakai props.',
      createdAt: '2024-11-21T10:45:00Z',
      repliesCount: 0,
      status: 'unanswered',
      replies: [],
    },
    {
      uid: 'qa-003',
      courseUid: 'course-003',
      authorUid: 'student-006',
      courseTitle: 'Fundamental UI/UX',
      title: 'Contoh user flow untuk aplikasi edukasi?',
      author: 'Bima Aditya',
      authorAvatar: 'https://i.pravatar.cc/100?img=41',
      body: 'Apakah ada referensi user flow sederhana untuk aplikasi belajar?',
      createdAt: '2024-11-23T13:10:00Z',
      repliesCount: 2,
      status: 'answered',
      replies: [
        {
          uid: 'qa-reply-002',
          author: 'Admin',
          authorAvatar: 'https://i.pravatar.cc/100?img=1',
          role: 'admin',
          body: 'Coba mulai dari: onboarding → pilih kursus → belajar materi → kuis → progres.',
          createdAt: '2024-11-23T14:00:00Z',
        },
        {
          uid: 'qa-reply-003',
          author: 'Siti Amalia',
          authorAvatar: 'https://i.pravatar.cc/100?img=55',
          role: 'student',
          body: 'Aku biasanya tambahkan langkah “bookmark materi” setelah belajar.',
          createdAt: '2024-11-23T14:20:00Z',
        },
      ],
    },
  ]

  return (
    <AppSidebarProvider role="admin" user={{ name: 'Admin', email: 'admin@doscom.id' }}>
      <div className="flex w-full flex-col gap-6">
        <PageHeader title="Reviews & Q&A" subtitle="Pantau review peserta, berikan balasan, dan tindak lanjuti diskusi Q&A secara terpusat." />
        <ReviewsQaTabs courseUid={courseUid as string} dataAdminReviews={dataAdminReviews} dataAdminQaThreads={dataAdminQaThreads} />
      </div>
    </AppSidebarProvider>
  )
}
