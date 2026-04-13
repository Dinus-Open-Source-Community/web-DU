import { DashboardStats, Deadlines, Feedbacks, ResumeCourses } from '@/lib/dummyData'
import React from 'react'
import { Award, Book, Calendar, CheckCircle, ClipboardCheck, LucideIcon, MessageSquare, PlayCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import StatCard from '@/components/dashboard/StatCard'
import DeadlineItem from '@/components/dashboard/DeadlineItem'
import FeedbackCard from '@/components/dashboard/FeedbackCard'

const iconMap: Record<string, LucideIcon> = {
  Book,
  ClipboardCheck,
  Award,
  CheckCircle,
}

const SectionPage = () => {
  return (
    <section className="pt-10 px-8 pb-12 ">
      {/* Welcome Section */}
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-on-surface font-headline">Halo, Budi 👋</h1>
        <p className="text-on-surface-variant mt-1">Siap untuk melanjutkan perjalanan belajarmu hari ini?</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {DashboardStats.map((stat) => {
          const Icon = iconMap[stat.iconName]

          return <StatCard key={stat.label} variant="compact" label={stat.label} value={stat.value} icon={Icon ? <Icon className="h-5 w-5" /> : undefined} />
        })}
      </div>

      {/* Resume Learning Section */}
      <div className="mb-10">
        <h2 className="text-xl font-bold font-headline mb-6 flex items-center gap-2">
          <PlayCircle className="text-primary" size={24} />
          Lanjutkan Belajar
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ResumeCourses.slice(0, 3).map((course, i) => (
            <Card key={i} variant="resume" {...course} />
          ))}
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Deadlines Section */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold font-headline flex items-center gap-2">
              <Calendar className="text-error" size={24} />
              Tenggat Waktu
            </h2>
          </div>

          <div className="space-y-4">
            {Deadlines.slice(0, 5).map((d, i) => (
              <DeadlineItem key={i} month={d.month} day={d.day} title={d.title} course={d.course} isPast={d.isPast} />
            ))}
          </div>
        </div>

        {/* Feedback Section */}
        <div>
          <h2 className="text-xl font-bold font-headline mb-6 flex items-center gap-2">
            <MessageSquare className="text-secondary" size={24} />
            Umpan Balik
          </h2>

          <div className="space-y-4">
            {Feedbacks.slice(0, 3).map((fb, i) => (
              <FeedbackCard key={i} status={fb.status} time={fb.time} title={fb.title} comment={fb.comment} instructor={fb.instructor} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default SectionPage
