import { appPageContentCenteredClassName } from '@/lib/layout/page-layout'
import { AppSidebarProvider } from "@/components/shared/Sidebar";
import TransactionsList from "@/components/student/TransactionsSection";
import { useSidebarUser } from "@/hooks/use-sidebar-user";
import type { IUserData } from "@/lib/types/user";
import { useAuth } from "@/providers/auth-provider";

const Transactions = () => {
  const { profile } = useAuth();
  const sidebarUser = useSidebarUser("student");

  return (
    <AppSidebarProvider
      role="student"
      user={sidebarUser}
      contentClassName={appPageContentCenteredClassName}
    >
      <TransactionsList Data={profile as IUserData | null} />
    </AppSidebarProvider>
  );
};

export default Transactions;
