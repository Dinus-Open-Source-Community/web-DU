import StatCard from '@/components/dashboard/StatCard'
import { BarChart3, HelpCircle, Users, BookOpen } from 'lucide-react'
import { IMentorStats } from '@/lib/types'

interface QuickStatsProps {
  stats: IMentorStats
}

export default function QuickStats({ stats }: QuickStatsProps) {
  const statsData = [
    { label: 'Pending Grading', value: stats.pendingGrading, icon: <BarChart3 size={24} /> },
    { label: 'Q&A Unanswered', value: stats.unansweredQA, icon: <HelpCircle size={24} /> },
    { label: 'Active Students', value: stats.activeStudents, icon: <Users size={24} /> },
    { label: 'Total Courses', value: stats.totalCourses, icon: <BookOpen size={24} /> },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsData.map((stat) => (
        <StatCard key={stat.label} variant="compact" label={stat.label} value={stat.value} icon={stat.icon} colorClass="text-primary" bgClass="bg-primary/10" />
      ))}
    </div>
  )
}
