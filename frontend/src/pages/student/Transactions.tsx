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
      contentClassName="mx-auto w-full gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
    >
      <TransactionsList Data={profile as IUserData | null} />
    </AppSidebarProvider>
  );
};

export default Transactions;
