import type { AdminTransaction } from '../../lib/types/transaction'
import type { ChartRatioPoint, TransactionTimelinePoint } from '../../lib/types/utils'
import { TransactionsDashboard } from '../../components/Admin/Transactions/TransDashboard'
import { PageHeader } from '../../components/shared/Header'
import { AppSidebarProvider } from '../../components/shared/Sidebar'

export default function AdminTransactionsPage() {
  const dataTransactions: AdminTransaction[] = [
    {
      uid: 'tx-001',
      transactionId: 'TRX-20240508-001',
      courseUid: 'course-001',
      studentUid: 'student-001',
      courseImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
      courseName: 'UI/UX Design Fundamentals',
      classType: 'Premium',
      price: 350000,
      paymentStatus: 'success',
      purchasedAt: '2024-05-08T10:30:00.000Z',
      paymentMethod: 'Bank Transfer',
      studentName: 'Alya Putri',
      studentAvatar: 'https://i.pravatar.cc/150?img=32',
    },
  ]
  const dataTimeline: TransactionTimelinePoint[] = [
    {
      label: '2024-05-05',
      paid: 12,
      pending: 3,
      failed: 1,
    },
    {
      label: '2024-05-06',
      paid: 8,
      pending: 2,
      failed: 0,
    },
    {
      label: '2024-05-07',
      paid: 15,
      pending: 1,
      failed: 2,
    },
    {
      label: '2024-05-08',
      paid: 20,
      pending: 0,
      failed: 0,
    },
  ]

  const dataRatio: ChartRatioPoint[] = [
    { label: 'Paid', value: 75, color: '#10B981' },
    { label: 'Pending', value: 20, color: '#F59E0B' },
    { label: 'Failed', value: 5, color: '#EF4444' },
  ]

  return (
    <AppSidebarProvider role="admin" user={{ name: 'Admin', email: 'admin@doscom.id' }}>
      <div className="flex flex-col gap-6">
        <PageHeader title="Transaksi" subtitle="Pantau pendapatan, rasio status pembayaran, dan semua transaksi platform." />
        <TransactionsDashboard dataTransactions={dataTransactions} dataRatio={dataRatio} dataTimeline={dataTimeline} />
      </div>
    </AppSidebarProvider>
  )
}
