import { StudentAppPageShell } from '@/components/student/StudentAppPageShell'
import TransactionsList from "@/components/student/TransactionsSection";
import { useSidebarUser } from "@/hooks/use-sidebar-user";
import type { IUserData } from "@/lib/types/user";
import { useAuth } from "@/providers/auth-provider";

const Transactions = () => {
  const { profile } = useAuth();
  const sidebarUser = useSidebarUser("student");

  return (
    <StudentAppPageShell user={sidebarUser}>
      <TransactionsList Data={profile as IUserData | null} />
    </StudentAppPageShell>
  );
};

export default Transactions;
