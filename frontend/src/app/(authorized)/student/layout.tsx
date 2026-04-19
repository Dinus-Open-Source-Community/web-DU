'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { studentNavigation } from '@/lib/navigation'
import { useSidebarContext } from '../layout'
import { cn } from '@/lib/utils'
import { useUser } from '@/hooks/useUser'
import { toSidebarUser } from '@/lib/data/dummyUsers'
import { clearGuestSession } from '@/lib/auth/guest-session'

/** Halaman detail transaksi (/student/transactions/[uid]) tanpa sidebar (full lebar). */
function isStudentTransactionDetailRoute(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)
  return segments[0] === 'student' && segments[1] === 'transactions' && segments.length >= 3
}

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = useUser()
  const pathname = usePathname()
  const router = useRouter()
  const { isOpen, isMinimized, close, toggleMinimize } = useSidebarContext()
  const hideSidebar = isStudentTransactionDetailRoute(pathname)

  return (
    <div className="flex min-h-screen w-full bg-[#f5f5f5]">
      {!hideSidebar && (
        <Sidebar
          navigation={studentNavigation}
          isOpen={isOpen}
          onClose={close}
          isMinimized={isMinimized}
          onToggleMinimize={toggleMinimize}
          user={toSidebarUser(user)}
          onLogout={() => {
            clearGuestSession()
            router.push('/auth/login')
          }}
          onProfile={() => {
            router.push('/profile')
          }}
        />
      )}

      <div
        className={cn(
          'flex min-w-0 flex-1 flex-col transition-[margin] duration-150 ease-out',
          !hideSidebar && (isMinimized ? 'lg:ml-20' : 'lg:ml-64')
        )}>
        <main className={cn('flex-1', hideSidebar ? 'p-4 sm:p-6 lg:p-8' : 'p-6')}>{children}</main>
      </div>
    </div>
  )
}
