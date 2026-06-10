import { SearchForm } from '@/components/shared/SearchForm'
import { PageHeader } from '@/components/shared/Header'
import { SegmentedFilter } from '@/components/shared/SegemntedFilter'
import { Pagination } from '@/components/shared/Pagination'
import { SafeLottie } from '@/components/ui/lottie'
import { TransactionPaymentLink } from '@/components/student/transactions/TransactionPaymentLink'
import { useStudentTransactionsViewModel } from '@/hooks/use-student-transactions-view-model'
import { buildCourseImageMap } from '@/lib/transactions/build-course-image-map'
import type { TransactionStatusFilter } from '@/lib/transactions/filter-transactions'
import { FormatRupiah } from '@/lib/func/func'
import type { IUserData } from '@/lib/types/user'
import { PaymentBadge } from '@/components/ui/badge'
import { ReactIcon } from '@/components/shared/icon'
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
    <section className="h-full w-full">
      <PageHeader
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

          <SegmentedFilter
            value={viewModel.statusFilter}
            onChange={(value) => viewModel.setStatusFilter(value as TransactionStatusFilter)}
            items={STATUS_FILTER_OPTIONS}
            variant="wrap"
          />
        </div>

        {!viewModel.hasTransactions ? (
          <div className="flex min-h-[60vh] w-full items-center justify-center text-center">
            <div className="flex flex-col items-center gap-4">
              <SafeLottie src="/transaction-not-found.lottie" />
              <div className="space-y-1">
                <p className="text-base font-semibold text-slate-900">Transaksi tidak ditemukan</p>
                <p className="text-sm text-slate-500">
                  Coba ubah kata kunci pencarian atau filter status pembayaran.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.05)]">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
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
                  <TableRow key={item.uid} className="hover:bg-slate-50/70">
                    <TableCell>
                      <div className="h-12 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                        {item.course?.uid && courseImagesByUid.get(item.course.uid) ? (
                          <img
                            src={courseImagesByUid.get(item.course.uid)}
                            alt={item.course.title ?? 'Kursus'}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <ReactIcon />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="line-clamp-2 font-semibold whitespace-normal text-slate-900">
                        {item.course?.title ?? 'Kursus tidak tersedia'}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-500">{item.reference}</TableCell>
                    <TableCell>
                      <PaymentBadge status={item.payment_status} />
                    </TableCell>
                    <TableCell className="font-medium text-slate-600">{item.payment_method}</TableCell>
                    <TableCell className="text-slate-500">
                      {item.paid_at
                        ? new Date(item.paid_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'Belum dibayar'}
                    </TableCell>
                    <TableCell className="text-right font-bold text-slate-950">
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
