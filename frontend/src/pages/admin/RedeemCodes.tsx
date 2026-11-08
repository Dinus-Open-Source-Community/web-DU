import { useMemo, useState } from 'react'
import {
  Check,
  Copy,
  Plus,
  RefreshCw,
  Search,
  Ticket,
  ChevronDown,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'

import { AppSidebarProvider } from '@/components/shared/Sidebar'
import { AdminPageShell } from '@/components/admin/AdminPageShell'
import { AdminDataTable } from '@/components/shared/AdminDataTable'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { GenerateRedeemCodeDialog } from '@/components/admin/redeem/GenerateRedeemCodeDialog'
import { UserIdentityCell } from '@/components/admin/user-manage/UserIdentityCell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAdminAppSidebar } from '@/hooks/use-sidebar-user'
import { useDeleteRedeemCode, useRedeemCodes } from '@/hooks/use-redeem-codes'
import { useCourses } from '@/hooks/use-course'
import { useMentorCourses } from '@/hooks/mentor-courses/use-mentor-courses'
import { useAuth } from '@/providers/auth-provider'
import type { IAdminDataTableColumn } from '@/lib/types/components/admin-table'
import type { IRedeemCodeItem } from '@/services/redeem'
import {
  appPageTitleClassName,
  appPageSubtitleClassName,
  appCardClassName,
} from '@/lib/design/app-shell-tokens'
import { cn } from '@/lib/utils'

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

const dateTimeFormatter = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

function StatusLabel({
  label,
  className,
  dotClassName,
}: {
  label: string
  className: string
  dotClassName: string
}) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-xs font-semibold', className)}>
      <span className={cn('size-2 shrink-0 rounded-full', dotClassName)} aria-hidden="true" />
      {label}
    </span>
  )
}

export default function AdminRedeemCodesPage() {
  const { role: shellRole, user: sidebarUser } = useAdminAppSidebar()
  const { profile } = useAuth()
  const isMentor = profile?.role === 'mentor'
  const canDelete = profile?.role === 'admin' || profile?.role === 'super_admin'

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [copiedUid, setCopiedUid] = useState<string | null>(null)
  const [isGenerateOpen, setIsGenerateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<IRedeemCodeItem | null>(null)
  const deleteMutation = useDeleteRedeemCode()

  // Fetch courses for filter dropdown
  const allCoursesQuery = useCourses({ per_page: 100 }, { enabled: !isMentor })
  const mentorCoursesQuery = useMentorCourses()
  const courses = isMentor
    ? mentorCoursesQuery.courses
    : allCoursesQuery.data?.courses ?? []

  // Fetch redeem codes with query params
  const { data: redeemData, isLoading, isFetching, refetch } = useRedeemCodes({
    page,
    per_page: pageSize,
    course_uid: selectedCourseFilter || undefined,
    is_active: statusFilter ? statusFilter === 'true' : undefined,
  })

  const meta = redeemData?.meta

  // Filter in-memory for local search text (code, target_email, course_title, student name)
  const filteredItems = useMemo(() => {
    const rawItems = redeemData?.items ?? []
    if (!searchInput.trim()) return rawItems
    const q = searchInput.trim().toLowerCase()
    return rawItems.filter((item) => {
      const codeMatch = item.code.toLowerCase().includes(q)
      const courseMatch = item.course_title.toLowerCase().includes(q)
      const emailMatch = item.target_email?.toLowerCase().includes(q)
      const nameMatch = item.target_user?.name.toLowerCase().includes(q)
      return codeMatch || courseMatch || emailMatch || nameMatch
    })
  }, [redeemData?.items, searchInput])

  const handleCopyCode = async (code: string, uid: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedUid(uid)
      toast.success(`Kode "${code}" disalin ke clipboard!`)
      setTimeout(() => setCopiedUid(null), 2000)
    } catch {
      toast.error('Gagal menyalin kode.')
    }
  }

  // Define Table Columns
  const columns = useMemo<IAdminDataTableColumn<IRedeemCodeItem>[]>(
    () => [
      {
        id: 'code',
        header: 'Kode Voucher',
        cell: (item) => {
          const isCopied = copiedUid === item.uid
          return (
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-semibold tracking-wide text-primary">
                {item.code}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleCopyCode(item.code, item.uid)
                }}
                className={cn(
                  'size-7 rounded-sm p-0 transition-colors',
                  isCopied
                    ? 'text-emerald-700'
                    : 'text-ink-400 hover:bg-paper-paper hover:text-ink-900',
                )}
                title="Salin kode"
              >
                {isCopied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              </Button>
            </div>
          )
        },
      },
      {
        id: 'course',
        header: 'Kursus',
        cell: (item) => (
          <div className="max-w-[240px]">
            <span className="block truncate font-medium text-ink-900" title={item.course_title}>
              {item.course_title}
            </span>
          </div>
        ),
      },
      {
        id: 'target',
        header: 'Target Siswa',
        cell: (item) => {
          if (item.target_user) {
            return (
              <UserIdentityCell
                name={item.target_user.name}
                email={item.target_user.email}
                avatar={item.target_user.avatar_url}
              />
            )
          }
          if (item.target_email) {
            return (
              <div className="flex min-w-0 flex-col">
                <span className="max-w-[220px] truncate text-xs font-medium text-ink-800" title={item.target_email}>
                  {item.target_email}
                </span>
                <span className="text-xs text-ink-500">Email tujuan</span>
              </div>
            )
          }
          return (
            <span className="text-sm text-ink-500">Tanpa target</span>
          )
        },
      },
      {
        id: 'usage',
        header: 'Penggunaan',
        align: 'right',
        cell: (item) => {
          const isExhausted = item.used_count >= item.max_uses && item.max_uses > 0
          return (
            <div className="inline-flex items-center gap-1.5">
              <span
                className={cn(
                  'font-mono text-sm tabular-nums',
                  isExhausted ? 'text-rose-700' : 'text-ink-700',
                )}
              >
                {item.used_count} / {item.max_uses}
              </span>
            </div>
          )
        },
      },
      {
        id: 'status',
        header: 'Status',
        align: 'left',
        cell: (item) => {
          const isExpired = item.expires_at ? new Date(item.expires_at) < new Date() : false
          const isExhausted = item.used_count >= item.max_uses && item.max_uses > 0

          if (!item.is_active) {
            return (
              <StatusLabel
                label="Nonaktif"
                className="text-ink-500"
                dotClassName="bg-ink-300"
              />
            )
          }
          if (isExpired) {
            return (
              <StatusLabel
                label="Kedaluwarsa"
                className="text-rose-700"
                dotClassName="bg-rose-600"
              />
            )
          }
          if (isExhausted) {
            return (
              <StatusLabel
                label="Kuota penuh"
                className="text-amber-700"
                dotClassName="bg-amber-600"
              />
            )
          }
          return (
            <StatusLabel
              label="Aktif"
              className="text-emerald-700"
              dotClassName="bg-emerald-600"
            />
          )
        },
      },
      {
        id: 'expires_at',
        header: 'Masa Berlaku',
        align: 'right',
        cell: (item) => {
          if (!item.expires_at) {
            return <span className="text-xs text-ink-400">Permanen</span>
          }
          return (
            <span className="text-xs text-ink-700">
              {dateTimeFormatter.format(new Date(item.expires_at))}
            </span>
          )
        },
      },
      {
        id: 'created_at',
        header: 'Dibuat',
        align: 'right',
        cell: (item) => (
          <span className="text-xs text-ink-500">
            {dateFormatter.format(new Date(item.created_at))}
          </span>
        ),
      },
      ...(canDelete
        ? [{
            id: 'actions',
            header: 'Aksi',
            align: 'right' as const,
            cell: (item: IRedeemCodeItem) => (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={item.used_count > 0}
                onClick={(e) => {
                  e.stopPropagation()
                  setDeleteTarget(item)
                }}
                className="rounded-sm text-ink-500 shadow-none hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-40"
                title={item.used_count > 0 ? 'Kode yang pernah digunakan tidak dapat dihapus' : 'Hapus kode redeem'}
                aria-label={`Hapus kode redeem ${item.code}`}
              >
                <Trash2 className="size-4" aria-hidden />
              </Button>
            ),
          }]
        : []),
    ],
    [canDelete, copiedUid],
  )

  const handleDelete = async () => {
    if (!deleteTarget || deleteMutation.isPending) return
    try {
      await deleteMutation.mutateAsync(deleteTarget.uid)
      toast.success('Kode redeem berhasil dihapus.')
      if ((redeemData?.items.length ?? 0) === 1 && page > 1) setPage((current) => current - 1)
      setDeleteTarget(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus kode redeem.')
    }
  }

  return (
    <AppSidebarProvider role={shellRole} user={sidebarUser}>
      <AdminPageShell>
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className={appPageTitleClassName}>Kode Redeem</h1>
            <p className={appPageSubtitleClassName}>
              Buat dan kelola voucher kursus untuk siswa dengan filter calon peserta terintegrasi.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="rounded-xl border-2 border-ink-900/10 hover:bg-paper-paper text-ink-700"
              title="Segarkan data"
            >
              <RefreshCw className={cn('size-4', isFetching && 'animate-spin')} />
              <span className="hidden sm:inline">Segarkan</span>
            </Button>

            <GenerateRedeemCodeDialog
              open={isGenerateOpen}
              onOpenChange={setIsGenerateOpen}
              onSuccess={() => refetch()}
              trigger={
                <Button
                  type="button"
                  className="rounded-xl bg-primary px-4 font-semibold text-white shadow-paper hover:bg-primary/90 transition-all active:scale-[0.98]"
                >
                  <Plus className="size-4 mr-1.5" />
                  Buat Kode Redeem
                </Button>
              }
            />
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className={cn('p-4 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3', appCardClassName)}>
          {/* Search text */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-ink-400" />
            <Input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari kode, kursus, email, atau siswa..."
              className="pl-10 h-10 rounded-xl border-ink-900/15 text-sm"
            />
          </div>

          {/* Filter Course */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={selectedCourseFilter}
                onChange={(e) => {
                  setSelectedCourseFilter(e.target.value)
                  setPage(1)
                }}
                className="h-10 appearance-none rounded-xl border-2 border-ink-900/15 bg-paper-white py-2 pl-3 pr-10 text-xs font-semibold text-ink-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Semua Kursus</option>
                {courses.map((course) => (
                  <option key={course.uid} value={course.uid}>
                    {course.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
            </div>

            {/* Filter Status */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPage(1)
                }}
                className="h-10 appearance-none rounded-xl border-2 border-ink-900/15 bg-paper-white py-2 pl-3 pr-10 text-xs font-semibold text-ink-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Semua Status</option>
                <option value="true">Aktif</option>
                <option value="false">Nonaktif</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
            </div>
          </div>
        </div>

        {/* Data Table */}
        <AdminDataTable
          columns={columns}
          variant="admin"
          data={filteredItems}
          keyField={(item) => item.uid}
          page={page}
          totalPages={meta?.total_pages ?? 1}
          total={meta?.total ?? filteredItems.length}
          pageSize={pageSize}
          pageSizeOptions={[10, 20, 50]}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize)
            setPage(1)
          }}
          emptyState={
            isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-ink-500 text-sm">
                <RefreshCw className="size-6 animate-spin text-primary mb-2" />
                Memuat data kode redeem...
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Ticket className="size-7" />
                </div>
                <div>
                  <p className="text-base font-bold text-ink-900">Belum Ada Kode Redeem</p>
                  <p className="text-xs text-ink-500 max-w-sm mt-1">
                    {selectedCourseFilter || statusFilter || searchInput
                      ? 'Tidak ada kode redeem yang cocok dengan filter yang dipilih.'
                      : 'Belum ada kode redeem yang dibuat. Buat kode redeem pertama untuk mengundang siswa.'}
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={() => setIsGenerateOpen(true)}
                  className="rounded-xl bg-primary font-semibold text-white shadow-paper hover:bg-primary/90 mt-2"
                >
                  <Plus className="size-4 mr-1.5" />
                  Buat Kode Redeem
                </Button>
              </div>
            )
          }
        />
        <ConfirmDialog
          open={Boolean(deleteTarget)}
          onOpenChange={(open) => {
            if (!open && !deleteMutation.isPending) setDeleteTarget(null)
          }}
          title="Hapus kode redeem?"
          description={deleteTarget
            ? `Kode "${deleteTarget.code}" akan dihapus permanen. Kode yang pernah digunakan tidak dapat dihapus.`
            : undefined}
          confirmLabel={deleteMutation.isPending ? 'Menghapus...' : 'Hapus kode'}
          cancelLabel="Batal"
          variant="destructive"
          onConfirm={(event) => {
            event.preventDefault()
            void handleDelete()
          }}
        />
      </AdminPageShell>
    </AppSidebarProvider>
  )
}
