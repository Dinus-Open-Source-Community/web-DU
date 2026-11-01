import { AdminDashboardRouteFallback } from '@/components/Admin/Dashboard/DashboardSkeletons'
import { MentorDashboardRouteFallback } from '@/components/mentor/dashboard/MentorDashboardSkeletons'
import { StudentDashboardRouteFallback } from '@/components/student/dashboard/StudentDashboardSkeletons'
import { PageSkeleton } from '@/components/shared/PageSkeleton'
import { useAuth } from '@/providers/auth-provider'

/**
 * Fallback Suspense route `/dashboard`, dipilih sesuai role:
 * - admin & super admin → skeleton dasbor admin (chrome + KPI + kartu analitik)
 * - mentor → skeleton dasbor mentor (chrome + KPI + grafik + kalender)
 * - siswa → skeleton dasbor siswa (chrome + KPI + kursus + tenggat + umpan balik)
 *
 * Dipakai oleh fallback route di `App` dan fallback chunk per-role di
 * `DashboardGateway`, sehingga saat refresh hanya ada satu skeleton yang
 * bentuknya sama dengan halaman akhirnya.
 */
export function DashboardRouteFallback() {
  const { role } = useAuth()

  if (role === 'admin' || role === 'super_admin') {
    return <AdminDashboardRouteFallback />
  }

  if (role === 'mentor') {
    return <MentorDashboardRouteFallback />
  }

  if (role === 'student') {
    return <StudentDashboardRouteFallback />
  }

  return (
    <PageSkeleton
      message="Memuat dashboard..."
      className="min-h-dvh justify-center px-4 sm:px-6 lg:px-8"
    />
  )
}
