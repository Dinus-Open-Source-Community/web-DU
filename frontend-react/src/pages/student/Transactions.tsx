import { StudentSidebarProvider } from '@/components/shared/Sidebar'
import TransactionsList from '@/components/student/TransactionsSection'
import type { TransactionHistory } from '@/lib/types/transaction'

const Transactions = () => {
  const Data: TransactionHistory[] = [
    {
      amount: 1000,
      checkout_url: 'https://tripay.co.id/checkout/DEV-T50204372100LMEZ0',
      course: {
        slug: 'devops-essentials',
        title: 'DevOps Essentials',
        uid: '6f43bd95',
      },
      enrollment_status: 'active',
      enrollment_uid: 'cb0a6b50',
      paid_at: '2026-05-24T07:25:35Z',
      payment_method: 'QRIS2',
      payment_status: 'success',
      reference: 'DEV-T50204372100LMEZ0',
      transaction_at: '2026-05-23T17:25:26.874354Z',
      uid: '68c3ba24',
    },
    {
      amount: 1000,
      checkout_url: 'https://tripay.co.id/checkout/DEV-T502043720528D0RH',
      course: {
        slug: 'rest-api-development',
        title: 'REST API Development',
        uid: 'eca32b12',
      },
      enrollment_status: 'pending',
      enrollment_uid: '15761328',
      paid_at: null,
      payment_method: 'QRIS2',
      payment_status: 'pending',
      reference: 'DEV-T502043720528D0RH',
      transaction_at: '2026-05-23T11:40:30.590308Z',
      uid: '11aeea4b',
    },
  ]
  return (
    <StudentSidebarProvider>
      <TransactionsList Data={Data} />
    </StudentSidebarProvider>
  )
}

export default Transactions
