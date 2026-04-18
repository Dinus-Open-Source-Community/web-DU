'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { ArrowLeft, KeyRound, LayoutGrid, Rows3, Mail, Phone, CalendarDays } from 'lucide-react'

import { AdminDataTable, type AdminDataTableColumn } from '@/components/admin/AdminDataTable'
import { ResetCredentialsDialog } from '@/components/admin/ResetCredentialsDialog'
import { Badge, PaymentBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { listAdminTransactions, listStudentEnrolledCourses } from '@/lib/data/repository'
import type { AdminStudent, AdminTransaction } from '@/lib/types'
import { formatRupiah } from '@/lib/func'
import { cn } from '@/lib/utils'

interface StudentDetailViewProps {
  student: AdminStudent
}

type LayoutMode = 'grid' | 'table'

const statusLabelByStatus: Record<AdminStudent['status'], string> = {
  active: 'Aktif',
  inactive: 'Nonaktif',
  pending: 'Pending',
}

const statusVariantByStatus: Record<
  AdminStudent['status'],
  'userActive' | 'userInactive' | 'userPending'
> = {
  active: 'userActive',
  inactive: 'userInactive',
  pending: 'userPending',
}

export function StudentDetailView({ student }: StudentDetailViewProps) {
  const [resetOpen, setResetOpen] = useState(false)
  const [txLayout, setTxLayout] = useState<LayoutMode>('table')

  const transactions = listAdminTransactions()
  const enrolledCourses = listStudentEnrolledCourses()

  const studentTransactions = useMemo<AdminTransaction[]>(
    () =>
      transactions
        .filter((_, i) => i % 3 === Number(student.uid.slice(-1)) % 3)
        .slice(0, 6),
    [student.uid, transactions]
  )

  const transactionColumns: AdminDataTableColumn<AdminTransaction>[] = [
    {
      id: 'id',
      header: 'Transaksi',
      cell: (t) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-800">{t.transactionId}</span>
          <span className="text-xs text-slate-400">{t.paymentMethod}</span>
        </div>
      ),
    },
    {
      id: 'course',
      header: 'Kursus',
      cell: (t) => <span className="line-clamp-1 max-w-[280px] text-slate-700">{t.courseName}</span>,
    },
    {
      id: 'status',
      header: 'Status',
      cell: (t) => <PaymentBadge status={t.paymentStatus} />,
    },
    {
      id: 'price',
      header: 'Total',
      align: 'right',
      cell: (t) => (
        <span className="font-semibold tabular-nums text-slate-900">
          {t.price === 0 ? 'Gratis' : formatRupiah(t.price)}
        </span>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="h-8 w-fit gap-1.5 rounded-lg px-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-900">
        <Link href="/admin/users/students">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          Kembali ke daftar siswa
        </Link>
      </Button>

      <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-slate-100">
            <Image src={student.avatar} alt={student.name} fill className="object-cover" sizes="64px" />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">{student.name}</h2>
              <Badge variant={statusVariantByStatus[student.status]}>
                {statusLabelByStatus[student.status]}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                {student.email}
              </span>
              {student.phone && (
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                  {student.phone}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                Bergabung {student.joinedAt}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="h-10 gap-1.5 rounded-xl border-slate-200 text-sm font-semibold text-slate-700 shadow-none hover:bg-slate-50"
            onClick={() => setResetOpen(true)}>
            <KeyRound className="h-4 w-4" aria-hidden />
            Reset Credentials
          </Button>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="Kursus Terdaftar" value={student.enrolledCourses.toString()} />
        <StatTile label="Rata-rata Progres" value={`${student.averageProgress}%`} />
        <StatTile label="Total Pembelian" value={formatRupiah(student.totalSpent)} />
        <StatTile label="Terakhir Aktif" value={student.lastActive} />
      </section>

      <Tabs defaultValue="courses" className="flex flex-col gap-4">
        <TabsList variant="line" className="border-b border-slate-100 w-full justify-start rounded-none px-0 pb-0">
          <TabsTrigger value="courses" className="text-sm">
            Kursus Terdaftar
          </TabsTrigger>
          <TabsTrigger value="transactions" className="text-sm">
            Riwayat Transaksi
          </TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="mt-2">
          {enrolledCourses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-10 text-center text-sm text-slate-500">
              Belum ada kursus terdaftar.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {enrolledCourses.map((course) => (
                <Card
                  key={course.uid}
                  variant="resumeAdmin"
                  title={course.title}
                  image={course.image}
                  module={course.module}
                  progress={course.progress}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="transactions" className="mt-2">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm text-slate-500">
              Daftar pembelian yang dilakukan oleh {student.name}.
            </p>
            <LayoutToggle value={txLayout} onChange={setTxLayout} />
          </div>

          {txLayout === 'table' ? (
            <AdminDataTable
              data={studentTransactions}
              columns={transactionColumns}
              keyField={(t) => t.uid}
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {studentTransactions.map((t) => (
                <div
                  key={t.uid}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-400">
                        {t.transactionId}
                      </span>
                      <p className="mt-1 line-clamp-2 text-sm font-semibold text-slate-900">
                        {t.courseName}
                      </p>
                    </div>
                    <PaymentBadge status={t.paymentStatus} />
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-xs text-slate-500">{t.paymentMethod}</span>
                    <span className="text-sm font-bold tabular-nums text-slate-900">
                      {t.price === 0 ? 'Gratis' : formatRupiah(t.price)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <ResetCredentialsDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        userName={student.name}
        initialEmail={student.email}
      />
    </div>
  )
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <span className="text-lg font-bold tracking-tight text-slate-900">{value}</span>
    </div>
  )
}

function LayoutToggle({
  value,
  onChange,
}: {
  value: LayoutMode
  onChange: (v: LayoutMode) => void
}) {
  return (
    <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <button
        type="button"
        onClick={() => onChange('table')}
        className={cn(
          'inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 font-semibold transition-colors',
          value === 'table' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-700'
        )}>
        <Rows3 className="h-3.5 w-3.5" aria-hidden />
        Tabel
      </button>
      <button
        type="button"
        onClick={() => onChange('grid')}
        className={cn(
          'inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 font-semibold transition-colors',
          value === 'grid' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-700'
        )}>
        <LayoutGrid className="h-3.5 w-3.5" aria-hidden />
        Kartu
      </button>
    </div>
  )
}
