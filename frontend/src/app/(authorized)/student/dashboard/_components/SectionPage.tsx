'use client'

import { useUser } from '@/hooks/useUser'
import { useSelfUser } from '@/hooks/api'
import { Award, Book, Calendar, CheckCircle, ClipboardCheck, type LucideIcon, MessageSquare, PlayCircle } from 'lucide-react'
import { Card, StatCard } from '@/components/ui/card'
import DeadlineItem from '@/components/dashboard/DeadlineItem'
import FeedbackCard from '@/components/dashboard/FeedbackCard'

const iconMap: Record<string, LucideIcon> = {
  Book,
  ClipboardCheck,
  Award,
  CheckCircle,
}

export default function SectionPage() {
  const user = useUser()
  const { data: selfData } = useSelfUser()

  const joinedCourses = (selfData?.joined_courses as { uid: string; title: string; progress?: number; image?: string; module?: string }[]) ?? []
  const resumeCourses = joinedCourses.slice(0, 3)

  return (
    <section className="px-8 pb-12 pt-10">
      <div className="mb-10">
        <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">
          Halo, {user.nama} 👋
        </h1>
        <p className="mt-1 text-on-surface-variant">Siap untuk melanjutkan perjalanan belajarmu hari ini?</p>
      </div>

      <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {selfData?.enrollment_summary ? (
          Object.entries(selfData.enrollment_summary as Record<string, number>).map(([label, value]) => {
            const Icon = iconMap[label]
            return (
              <StatCard
                key={label}
                variant="compact"
                label={label}
                value={value}
                icon={Icon ? <Icon className="h-5 w-5" /> : undefined}
              />
            )
          })
        ) : (
          <div className="col-span-full rounded-xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500">
            Belum ada ringkasan data dashboard.
          </div>
        )}
      </div>

      <div className="mb-10">
        <h2 className="font-headline mb-6 flex items-center gap-2 text-xl font-bold">
          <PlayCircle className="text-primary" size={24} />
          Lanjutkan Belajar
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {resumeCourses.length > 0 ? (
            resumeCourses.map((course) => (
              <Card
                key={course.uid}
                variant="resume"
                title={course.title}
                progress={course.progress ?? 0}
                image={course.image}
                module={course.module ?? ''}
              />
            ))
          ) : (
            <div className="col-span-full rounded-xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500">
              Belum ada kursus untuk dilanjutkan.
            </div>
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
            <div className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500">
              Tidak ada tenggat waktu saat ini.
            </div>
          </div>
        </div>

        <div>
          <h2 className="font-headline mb-6 flex items-center gap-2 text-xl font-bold">
            <MessageSquare className="text-secondary" size={24} />
            Umpan Balik
          </h2>
          <div className="space-y-4">
            {((selfData?.course_reviews as { status?: string; time?: string; title?: string; comment?: string; instructor?: { name: string; avatar: string } }[]) ?? []).length > 0 ? (
              (selfData?.course_reviews as { status: 'Lulus' | 'Perlu Revisi'; time: string; title: string; comment: string; instructor: { name: string; avatar: string } }[])
                .slice(0, 3)
                .map((fb, i) => (
                  <FeedbackCard
                    key={i}
                    status={fb.status}
                    time={fb.time}
                    title={fb.title}
                    comment={fb.comment}
                    instructor={fb.instructor}
                  />
                ))
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500">
                Belum ada umpan balik terbaru.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
