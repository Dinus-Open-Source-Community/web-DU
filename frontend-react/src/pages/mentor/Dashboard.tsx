import CalendarView from '@/components/shared/Calendar/View'
import { PageHeader } from '@/components/shared/Header'
import QuickStats from '@/components/shared/QuickStats'
import { MentorSidebarProvider } from '@/components/shared/Sidebar'
import type { IMentorStats, IScheduleItem } from '@/lib/types/utils'

export default function MentorDashboardPage() {
  const dataStats: IMentorStats = {
    pendingGrading: 0,
    unansweredQA: 0,
    activeStudents: 0,
    totalCourses: 0,
  }

  const schedules: IScheduleItem[] = [
    {
      uid: 'sch-001',
      courseId: 'cs-101',
      courseName: 'Pemrograman Dasar',
      scheduleDate: '2024-10-10',
      scheduleTime: '09:00',
      endTime: '11:00',
      location: 'Ruang 101',
      classType: 'offline',
      studentCount: 28,
    },
    {
      uid: 'sch-002',
      courseId: 'web-201',
      courseName: 'Pengembangan Web',
      scheduleDate: '2024-10-12',
      scheduleTime: '13:00',
      endTime: '15:00',
      location: 'Lab Komputer A',
      classType: 'offline',
      studentCount: 32,
    },
    {
      uid: 'sch-003',
      courseId: 'uiux-301',
      courseName: 'UI/UX Design',
      scheduleDate: '2024-10-15',
      scheduleTime: '16:00',
      endTime: '18:00',
      location: 'Zoom Meeting',
      classType: 'online',
      studentCount: 24,
    },
  ] // Replace with actual schedule data

  return (
    <MentorSidebarProvider>
      <section className="px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <PageHeader title="Halo Mentor Budi!" subtitle="Selamat datang di dashboard Anda." />
        <div className="mb-10">
          <QuickStats stats={dataStats} />
        </div>
        <CalendarView schedules={schedules} />
      </section>
    </MentorSidebarProvider>
  )
}
