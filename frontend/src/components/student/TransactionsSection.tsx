import { SearchForm } from '@/components/shared/SearchForm'
import { PageHeader } from '@/components/shared/Header'
import { UnderlineTabList } from '@/components/shared/UnderlineTabList'
import { Pagination } from '@/components/shared/Pagination'
import { NothingLottieIllustration } from '@/components/playful/NothingLottieIllustration'
import { appCardClassName } from '@/lib/design/app-shell-tokens'
import { studentDashboardLayout } from '@/lib/layout/student-dashboard-layout'
import { cn } from '@/lib/utils'
import { TransactionPaymentLink } from '@/components/student/transactions/TransactionPaymentLink'
import { useStudentTransactionsViewModel } from '@/hooks/use-student-transactions-view-model'
import { buildCourseImageMap } from '@/lib/transactions/build-course-image-map'
import type { TransactionStatusFilter } from '@/lib/transactions/filter-transactions'
import { FormatRupiah } from '@/lib/func/func'
import type { IUserData } from '@/lib/types/user'
import { PaymentBadge } from '@/components/ui/badge'
import {
  CourseCardCover,
  CourseCardCoverCompactFrame,
} from '@/components/shared/CourseCardCover'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useMemo } from 'react'

const STATUS_FILTER_OPTIONS: { value: TransactionStatusFilter; label: string }[] = [
  { value: 'ALL', label: 'Semua' },
  { value: 'pending', label: 'Menunggu' },
  { value: 'success', label: 'Berhasil' },
  { value: 'failed', label: 'Gagal' },
]

type TransactionsListProps = {
  Data?: IUserData | null
}

export default function TransactionsList({ Data }: TransactionsListProps) {
  const viewModel = useStudentTransactionsViewModel(Data)
  const courseImagesByUid = useMemo(() => buildCourseImageMap(Data), [Data])

  return (
    <section className="flex w-full flex-col gap-8">
      <PageHeader
        className={studentDashboardLayout.pageHeader}
        title="Riwayat Transaksi"
        subtitle="Pantau status pembayaran kursus dan lihat detail transaksi untuk setiap pembayaran."
      />

      <div className="w-full space-y-6">
        <div className="flex flex-col gap-4">
          <SearchForm
            value={viewModel.searchInput}
            onChange={viewModel.setSearchInput}
            onSubmit={viewModel.submitSearch}
            placeholder="Cari referensi transaksi atau nama kursus..."
            className="md:flex-1"
          />

          <UnderlineTabList
            value={viewModel.statusFilter}
            options={STATUS_FILTER_OPTIONS}
            onChange={(value) => viewModel.setStatusFilter(value as TransactionStatusFilter)}
            ariaLabel="Status pembayaran"
            className="w-max max-w-full"
          />
        </div>

        {!viewModel.hasTransactions ? (
          <div className={cn(appCardClassName, "flex flex-col items-center px-6 py-16 text-center")}>
            <NothingLottieIllustration />
            <h3 className="mb-2 text-xl font-bold text-ink-900">Transaksi tidak ditemukan</h3>
            <p className="max-w-sm text-sm font-medium leading-relaxed text-ink-500">
              Coba ubah kata kunci pencarian atau filter status pembayaran.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border-2 border-ink-900/10 bg-paper-white shadow-paper">
            <Table>
              <TableHeader>
                <TableRow className="bg-paper-paper/80 hover:bg-paper-paper/80">
                  <TableHead className="w-[88px]">Kursus</TableHead>
                  <TableHead>Nama kursus</TableHead>
                  <TableHead>Referensi</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Metode</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="text-right">Nominal</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {viewModel.paginatedTransactions.map((item) => (
                  <TableRow key={item.uid} className="hover:bg-paper-paper/70">
                    <TableCell>
                      <CourseCardCoverCompactFrame className="w-16 rounded-xl">
                        <CourseCardCover
                          src={item.course?.uid ? courseImagesByUid.get(item.course.uid) : undefined}
                          alt={item.course?.title ?? 'Kursus'}
                          fill
                          className="rounded-xl"
                          imgClassName="rounded-xl"
                        />
                      </CourseCardCoverCompactFrame>
                    </TableCell>
                    <TableCell>
                      <span className="line-clamp-2 font-semibold whitespace-normal text-ink-900">
                        {item.course?.title ?? 'Kursus tidak tersedia'}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-ink-500">{item.reference}</TableCell>
                    <TableCell>
                      <PaymentBadge status={item.payment_status} />
                    </TableCell>
                    <TableCell className="font-medium text-ink-600">{item.payment_method}</TableCell>
                    <TableCell className="text-ink-500">
                      {item.paid_at
                        ? new Date(item.paid_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'Belum dibayar'}
                    </TableCell>
                    <TableCell className="text-right font-bold text-ink-900">
                      {FormatRupiah(item.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <TransactionPaymentLink transaction={item} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <Pagination
          currentPage={viewModel.currentPage}
          totalPages={viewModel.totalPages}
          onPageChange={viewModel.setCurrentPage}
        />
      </div>
    </section>
  )
}
