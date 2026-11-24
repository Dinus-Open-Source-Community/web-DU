import { useState } from 'react'
import { Copy, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { AdminPageShell } from '@/components/admin/AdminPageShell'
import { GenerateRedeemCodeDialog } from '@/components/admin/redeem/GenerateRedeemCodeDialog'
import { DashboardError } from '@/components/Admin/Dashboard/DashboardError'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { MentorAppPageShell } from '@/components/mentor/MentorAppPageShell'
import { AdminDataTable } from '@/components/shared/AdminDataTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useMentorCourses } from '@/hooks/mentor-courses/use-mentor-courses'
import { useDeleteRedeemCode, useRedeemCodes } from '@/hooks/use-redeem-codes'
import { appCardClassName, appPageSubtitleClassName, appPageTitleClassName } from '@/lib/design/app-shell-tokens'
import type { IAdminDataTableColumn } from '@/lib/types/components/admin-table'
import type { IRedeemCodeItem } from '@/services/redeem'
import { cn } from '@/lib/utils'

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric', month: 'short', year: 'numeric',
})

export default function MentorRedeemCodesPage() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [courseUid, setCourseUid] = useState('')
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [generateOpen, setGenerateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<IRedeemCodeItem | null>(null)
  const coursesQuery = useMentorCourses()
  const deleteMutation = useDeleteRedeemCode()
  const codesQuery = useRedeemCodes({
    page,
    per_page: pageSize,
    course_uid: courseUid || undefined,
    is_active: status ? status === 'true' : undefined,
  })
  const items = codesQuery.data?.items ?? []
  const query = search.trim().toLowerCase()
  const filteredItems = items.filter((item) => !query || [
    item.code, item.course_title, item.target_email, item.target_user?.name, item.target_user?.email,
  ].some((value) => value?.toLowerCase().includes(query)))
  const meta = codesQuery.data?.meta

  async function copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code)
      toast.success('Kode redeem disalin.')
    } catch {
      toast.error('Gagal menyalin kode. Silakan salin kode secara manual.')
    }
  }

  async function deleteCode() {
    if (!deleteTarget || deleteMutation.isPending) return
    try {
      await deleteMutation.mutateAsync(deleteTarget.uid)
      toast.success('Kode redeem berhasil dihapus.')
      if (items.length === 1 && page > 1) setPage((current) => current - 1)
      setDeleteTarget(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus kode redeem.')
    }
  }

  const columns: IAdminDataTableColumn<IRedeemCodeItem>[] = [
    {
      id: 'code', header: 'Kode Redeem',
      cell: (item) => (
        <div className="flex items-center gap-2">
          <span className="font-mono font-semibold text-ink-900">{item.code}</span>
          <Button
            type="button" variant="ghost" size="icon"
            className="size-11 shrink-0 rounded-lg text-ink-700"
            aria-label={`Salin kode ${item.code}`}
            onClick={() => void copyCode(item.code)}
          >
            <Copy className="size-4" aria-hidden="true" />
          </Button>
        </div>
      ),
    },
    {
      id: 'course', header: 'Kursus',
      cell: (item) => <span className="block max-w-64 break-words font-medium">{item.course_title}</span>,
    },
    {
      id: 'target', header: 'Target Siswa',
      cell: (item) => (
        <div className="max-w-64 break-words">
          {item.target_user ? (
            <><p className="font-medium">{item.target_user.name}</p><p className="text-xs text-ink-600">{item.target_user.email}</p></>
          ) : item.target_email || 'Semua siswa yang memenuhi syarat'}
        </div>
      ),
    },
    {
      id: 'usage', header: 'Penggunaan', align: 'right',
      cell: (item) => <span className="whitespace-nowrap tabular-nums">{item.used_count} / {item.max_uses}</span>,
    },
    {
      id: 'status', header: 'Status',
      cell: (item) => {
        const expired = item.expires_at && new Date(item.expires_at) <= new Date()
        return <span className="whitespace-nowrap font-medium">{
          !item.is_active ? 'Nonaktif' : expired ? 'Kedaluwarsa'
            : item.max_uses > 0 && item.used_count >= item.max_uses ? 'Kuota penuh' : 'Aktif'
        }</span>
      },
    },
    {
      id: 'expires', header: 'Masa Berlaku',
      cell: (item) => <span className="whitespace-nowrap">{item.expires_at ? dateFormatter.format(new Date(item.expires_at)) : 'Tanpa batas waktu'}</span>,
    },
    {
      id: 'actions', header: 'Aksi', align: 'right',
      cell: (item) => (
        <Button
          type="button" variant="ghost" size="icon-sm" className="size-11 rounded-lg text-ink-500 shadow-none hover:bg-rose-50 hover:text-rose-700"
          disabled={item.used_count > 0}
          title={item.used_count > 0 ? 'Kode yang pernah digunakan tidak dapat dihapus' : undefined}
          aria-label={`Hapus kode redeem ${item.code}`}
          onClick={() => setDeleteTarget(item)}
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </Button>
      ),
    },
  ]

  return (
    <MentorAppPageShell layout="content">
      <AdminPageShell>
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className={appPageTitleClassName}>Kode Redeem</h1>
            <p className={appPageSubtitleClassName}>Buat dan pantau kode akses siswa untuk kursus yang Anda ajar.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button" variant="outline" className="min-h-11 rounded-xl"
              disabled={codesQuery.isFetching}
              onClick={() => void codesQuery.refetch()}
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              {codesQuery.isFetching ? 'Memuat...' : 'Segarkan'}
            </Button>
            <GenerateRedeemCodeDialog
              open={generateOpen} onOpenChange={setGenerateOpen}
              initialCourseUid={courseUid || undefined}
              trigger={
                <Button type="button" className="min-h-11 rounded-xl">
                  <Plus className="size-4" aria-hidden="true" />Buat Kode Redeem
                </Button>
              }
            />
          </div>
        </header>

        <div className={cn(appCardClassName, 'grid min-w-0 gap-3 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.6fr)]')}>
          <label className="min-w-0 space-y-1.5 text-xs font-semibold text-ink-700">
            <span>Cari di halaman ini</span>
            <Input
              value={search} onChange={(event) => setSearch(event.target.value)}
              placeholder="Kode, kursus, atau siswa" className="min-h-11 rounded-xl"
            />
          </label>
          <label className="min-w-0 space-y-1.5 text-xs font-semibold text-ink-700">
            <span>Kursus yang Anda ajar</span>
            <select
              value={courseUid}
              onChange={(event) => { setCourseUid(event.target.value); setPage(1) }}
              disabled={coursesQuery.isLoading || coursesQuery.isError}
              className="min-h-11 w-full min-w-0 rounded-xl border border-ink-900/15 bg-paper-white px-3 text-sm focus-visible:outline-2 focus-visible:outline-primary"
            >
              <option value="">{coursesQuery.isLoading ? 'Memuat kursus...' : 'Semua kursus saya'}</option>
              {coursesQuery.courses.map((course) => <option key={course.uid} value={course.uid}>{course.title}</option>)}
            </select>
          </label>
          <label className="min-w-0 space-y-1.5 text-xs font-semibold text-ink-700">
            <span>Status</span>
            <select
              value={status}
              onChange={(event) => { setStatus(event.target.value); setPage(1) }}
              className="min-h-11 w-full rounded-xl border border-ink-900/15 bg-paper-white px-3 text-sm focus-visible:outline-2 focus-visible:outline-primary"
            >
              <option value="">Semua status</option>
              <option value="true">Aktif</option>
              <option value="false">Nonaktif</option>
            </select>
          </label>
        </div>

        {coursesQuery.isError && (
          <DashboardError message="Gagal memuat pilihan kursus. Muat ulang untuk menggunakan filter kursus." onRetry={() => void coursesQuery.refetch()} />
        )}
        {codesQuery.isError ? (
          <DashboardError message={codesQuery.error.message} onRetry={() => void codesQuery.refetch()} />
        ) : (
          <AdminDataTable
            columns={columns} data={filteredItems} keyField={(item) => item.uid} variant="admin"
            page={page} totalPages={meta?.total_pages ?? 1} total={meta?.total ?? 0}
            pageSize={pageSize} pageSizeOptions={[10, 20, 50]} onPageChange={setPage}
            onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
            emptyState={codesQuery.isLoading ? (
              <p role="status" className="text-center text-sm text-ink-700">Memuat kode redeem...</p>
            ) : (
              <div className="space-y-2 text-center">
                <p className="font-semibold text-ink-900">{query || courseUid || status ? 'Tidak ada kode yang cocok' : 'Belum ada kode redeem'}</p>
                <p className="text-sm text-ink-600">{query || courseUid || status
                  ? 'Ubah pencarian atau filter untuk melihat kode lainnya.'
                  : 'Buat kode redeem untuk memberi siswa akses ke kursus Anda.'}</p>
              </div>
            )}
          />
        )}
        <ConfirmDialog
          open={Boolean(deleteTarget)}
          onOpenChange={(open) => { if (!open && !deleteMutation.isPending) setDeleteTarget(null) }}
          title="Hapus kode redeem?"
          description={deleteTarget
            ? `Kode "${deleteTarget.code}" akan dihapus permanen. Kode yang pernah digunakan tidak dapat dihapus.`
            : undefined}
          confirmLabel={deleteMutation.isPending ? 'Menghapus...' : 'Hapus kode'}
          cancelLabel="Batal"
          variant="destructive"
          onConfirm={(event) => { event.preventDefault(); void deleteCode() }}
        />
      </AdminPageShell>
    </MentorAppPageShell>
  )
}
