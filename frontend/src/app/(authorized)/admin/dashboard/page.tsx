import { StatCard } from '@/components/ui/card'
import { Book, CalendarCheck, FileWarning, User } from 'lucide-react'
import UserDataTable from './_components/UserDataTable'

export default function DashboardPage() {
  return (
    <div className="px-2 lg:px-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#232323]">Welcome back, Admin!</h1>
        <h4 className="text-sm text-[#555555]">Here&apos;s an overview of Doscom university activities.</h4>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 my-4">
        <StatCard title="Total Courses" value="1,204" icon={<Book size={24} />} themeIcon="text-blue-600 bg-blue-100" />
        <StatCard title="Active Students" value="1,204" icon={<User size={24} />} themeIcon="text-green-500 bg-green-100" />
        <StatCard title="Attendance rate" value="1,204" icon={<CalendarCheck size={24} />} themeIcon="text-orange-600 bg-orange-100" />
        <StatCard title="Certificate issued" value="1,204" icon={<FileWarning size={24} />} themeIcon="text-red-600 bg-red-100" />
      </div>

      <UserDataTable />
    </div>
  )
}
