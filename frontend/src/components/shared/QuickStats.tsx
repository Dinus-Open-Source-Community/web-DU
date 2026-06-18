import type { IMentorStats } from '@/lib/types/utils'
import { gridStatsClassName } from '@/lib/layout/page-layout'
import { BarChart3, HelpCircle, Users, BookOpen } from 'lucide-react'
import { StatCard } from './StatCard'

interface QuickStatsProps {
  stats: IMentorStats
}

export default function QuickStats({ stats }: QuickStatsProps) {
  const statsData = [
    { label: 'Menunggu dinilai', value: stats.pendingGrading, icon: <BarChart3 size={24} /> },
    { label: 'Pertanyaan belum dijawab', value: stats.unansweredQA, icon: <HelpCircle size={24} /> },
    { label: 'Siswa aktif', value: stats.activeStudents, icon: <Users size={24} /> },
    { label: 'Total kursus', value: stats.totalCourses, icon: <BookOpen size={24} /> },
  ]

  return (
    <div className={gridStatsClassName}>
      {statsData.map((stat) => (
        <StatCard key={stat.label} variant="compact" label={stat.label} value={stat.value} icon={stat.icon} colorClass="text-primary" bgClass="bg-primary/10" />
      ))}
    </div>
  )
}
