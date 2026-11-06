import { useMemo, useState } from 'react'
import {
  Check,
  Copy,
  Plus,
  RefreshCw,
  Search,
  Ticket,
  BookOpen,
} from 'lucide-react'
import { toast } from 'sonner'

import { AppSidebarProvider } from '@/components/shared/Sidebar'
import { AdminPageShell } from '@/components/admin/AdminPageShell'
import { AdminDataTable } from '@/components/shared/AdminDataTable'
import { GenerateRedeemCodeDialog } from '@/components/admin/redeem/GenerateRedeemCodeDialog'
import { UserIdentityCell } from '@/components/admin/user-manage/UserIdentityCell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAdminAppSidebar } from '@/hooks/use-sidebar-user'
import { useRedeemCodes } from '@/hooks/use-redeem-codes'
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

export default function AdminRedeemCodesPage() {
  const { role: shellRole, user: sidebarUser } = useAdminAppSidebar()
  const { profile } = useAuth()
  const isMentor = profile?.role === 'mentor'

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [copiedUid, setCopiedUid] = useState<string | null>(null)
  const [isGenerateOpen, setIsGenerateOpen] = useState(false)

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
              <span className="font-mono text-sm font-bold tracking-wider text-primary bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/15">
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
                  'size-7 p-0 rounded-md transition-all',
                  isCopied
                    ? 'text-emerald-600 bg-emerald-50'
                    : 'text-ink-400 hover:text-ink-900 hover:bg-paper-paper',
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
          <div className="flex items-center gap-2 max-w-[240px]">
            <BookOpen className="size-4 shrink-0 text-ink-400" />
            <span className="truncate font-semibold text-ink-900" title={item.course_title}>
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
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-ink-800">{item.target_email}</span>
                <span className="text-[10px] text-ink-400">(Email eksternal / belum login)</span>
              </div>
            )
          }
          return (
            <span className="inline-flex items-center rounded-md bg-paper-paper px-2.5 py-1 text-xs font-medium text-ink-600 border border-ink-900/10">
              Voucher Umum
            </span>
          )
        },
      },
      {
        id: 'usage',
        header: 'Penggunaan',
        align: 'center',
        cell: (item) => {
          const isExhausted = item.used_count >= item.max_uses && item.max_uses > 0
          return (
            <div className="inline-flex items-center gap-1.5">
              <span
                className={cn(
                  'rounded-md px-2 py-0.5 text-xs font-bold font-mono',
                  isExhausted
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200',
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
        align: 'center',
        cell: (item) => {
          const isExpired = item.expires_at ? new Date(item.expires_at) < new Date() : false
          const isExhausted = item.used_count >= item.max_uses && item.max_uses > 0

          if (!item.is_active) {
            return (
              <span className="inline-flex rounded-full bg-ink-100 px-2.5 py-0.5 text-xs font-semibold text-ink-600">
                Nonaktif
              </span>
            )
          }
          if (isExpired) {
            return (
              <span className="inline-flex rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
                Kedaluwarsa
              </span>
            )
          }
          if (isExhausted) {
            return (
              <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                Kuota Penuh
              </span>
            )
          }
          return (
            <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
              Aktif
            </span>
          )
        },
      },
      {
        id: 'expires_at',
        header: 'Masa Berlaku',
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
        cell: (item) => (
          <span className="text-xs text-ink-500">
            {dateFormatter.format(new Date(item.created_at))}
          </span>
        ),
      },
    ],
    [copiedUid],
  )

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
            <select
              value={selectedCourseFilter}
              onChange={(e) => {
                setSelectedCourseFilter(e.target.value)
                setPage(1)
              }}
              className="h-10 rounded-xl border-2 border-ink-900/15 bg-paper-white px-3 text-xs font-semibold text-ink-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Semua Kursus</option>
              {courses.map((course) => (
                <option key={course.uid} value={course.uid}>
                  {course.title}
                </option>
              ))}
            </select>

            {/* Filter Status */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="h-10 rounded-xl border-2 border-ink-900/15 bg-paper-white px-3 text-xs font-semibold text-ink-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Semua Status</option>
              <option value="true">Aktif</option>
              <option value="false">Nonaktif</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <AdminDataTable
          columns={columns}
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
      </AdminPageShell>
    </AppSidebarProvider>
  )
}
