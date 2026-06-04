import { AppSidebarProvider } from '@/components/shared/Sidebar'
import TransactionsList from '@/components/student/TransactionsSection'
import type { IUserData } from '@/lib/types/user'
import { useAuth } from '@/providers/auth-provider'

const Transactions = () => {
  const { profile, user } = useAuth()
  return (
    <AppSidebarProvider role="student" user={user as IUserData}>
      <TransactionsList Data={profile as IUserData | null} />
    </AppSidebarProvider>
  )
}

export default Transactions
