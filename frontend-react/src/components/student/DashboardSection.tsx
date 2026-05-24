import { StatCard } from '@/components/shared/StatCard'
import { Calendar, MessageSquare, PlayCircle } from 'lucide-react'
import ResumeCard from '@/components/shared/ResumeCard'
import FeedbackCard from '@/components/shared/Feedback'
import type { IUserData } from '@/lib/types/user'

const DashboardSection = ({ Data }: { Data: IUserData }) => {
  const iconMap: Record<string, typeof PlayCircle | typeof MessageSquare | typeof Calendar> = {
    Aktif: PlayCircle,
    Selesai: MessageSquare,
    Pending: Calendar,
  }
  const joinedCourses = (Data?.joined_courses as { uid: string; title: string; progress?: number; image?: string; module?: string }[]) ?? []
  const resumeCourses = joinedCourses.filter((course) => course.progress !== undefined && course.progress < 100 && course.progress > 0)

  return (
    <section className="w-full flex-col gap-10 ">
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
  )
}

export default DashboardSection
