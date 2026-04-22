import { SidebarStateProvider } from '@/components/sidebar/sidebar-state-provider'

export default function AuthorizedLayout({ children }: { children: React.ReactNode }) {
  return <SidebarStateProvider>{children}</SidebarStateProvider>
}
