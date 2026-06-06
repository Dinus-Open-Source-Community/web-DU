import { AppSidebarProvider } from '@/components/shared/Sidebar'
import TransactionsList from '@/components/student/TransactionsSection'
import type { IUserData } from '@/lib/types/user'
import { useAuth } from '@/providers/auth-provider'
import { useSidebarUser } from '@/hooks/use-sidebar-user'

const Transactions = () => {
  const { profile } = useAuth()
  const sidebarUser = useSidebarUser('student')

  return (
    <AppSidebarProvider role="student" user={sidebarUser}>
      <TransactionsList Data={profile as IUserData | null} />
    </AppSidebarProvider>
  )
}

export default Transactions
