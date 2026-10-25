import { useCallback, useEffect, useMemo, useState } from 'react'
import { UserPlus } from 'lucide-react'

import { UserManagePageShell } from '@/components/admin/user-manage/UserManagePageShell'
import { UserManagePanel } from '@/components/admin/user-manage/UserManagePanel'
import { UserPromoteDialog } from '@/components/admin/user-manage/UserPromoteDialog'
import { useAdminUserPage } from '@/hooks/use-admin-user-page'
import { useManagedUsers } from '@/hooks/use-managed-users'
import { mapManagedUsers, toAdminMentor, toAdminStudent } from '@/lib/user-manage/mappers'
import { mentorToRow, rowsToPromoteCandidates, studentToRow } from '@/lib/user-manage/view-models'

export default function AdminMentorsPage() {
  const [promoteOpen, setPromoteOpen] = useState(false)
  const [promoteSearch, setPromoteSearch] = useState('')
  const [promoteSearchInput, setPromoteSearchInput] = useState('')
  const [promotePage, setPromotePage] = useState(1)
  const [promoteCandidates, setPromoteCandidates] = useState<ReturnType<typeof rowsToPromoteCandidates>>([])
  const mentorsPage = useAdminUserPage({ role: 'mentor' })
  const studentsQuery = useManagedUsers({
    page: promotePage,
    role: 'student',
    per_page: 20,
    search: promoteSearch || undefined,
    sort: 'created_at',
    order: 'desc',
  }, { enabled: promoteOpen })

  const rows = useMemo(
    () => mapManagedUsers(mentorsPage.users, toAdminMentor).map(mentorToRow),
    [mentorsPage.users],
  )

  const loadedCandidates = useMemo(() => {
    const students = mapManagedUsers(studentsQuery.data?.users ?? [], toAdminStudent).map(studentToRow)
    return rowsToPromoteCandidates(students, 'Siswa')
  }, [studentsQuery.data?.users])

  useEffect(() => {
    if (!promoteOpen || !studentsQuery.data) return
    setPromoteCandidates((current) => {
      if (promotePage === 1) return loadedCandidates
      const existing = new Set(current.map((candidate) => candidate.uid))
      return [...current, ...loadedCandidates.filter((candidate) => !existing.has(candidate.uid))]
    })
  }, [loadedCandidates, promoteOpen, promotePage, studentsQuery.data])

  const handlePromoteStudent = useCallback(
    async (uids: string[]) => {
      await mentorsPage.onBatchUpdateRole(uids, 'mentor')
    },
    [mentorsPage],
  )

  const handlePromoteSearch = useCallback((value: string) => {
    setPromoteSearchInput(value)
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setPromoteSearch(promoteSearchInput.trim()), 300)
    return () => window.clearTimeout(timeoutId)
  }, [promoteSearchInput])

  useEffect(() => {
    setPromotePage(1)
    setPromoteCandidates([])
  }, [promoteSearch])

  const isInitialLoading = mentorsPage.isLoading && rows.length === 0

  const promoteAction = (
    <UserPromoteDialog
      triggerLabel="Jadikan Mentor"
      triggerIcon={UserPlus}
      title="Jadikan Mentor"
      description="Pilih satu atau beberapa pengguna dari daftar siswa untuk dipromosikan menjadi mentor."
      confirmLabel="Tetapkan sebagai Mentor"
      searchPlaceholder="Cari siswa..."
      emptyTitle="Tidak ada calon mentor"
      emptyDescription="Semua siswa sudah menjadi mentor atau belum ada siswa terdaftar."
      footerHint={(name) => `${name} akan mendapatkan akses dashboard mentor.`}
      candidates={promoteCandidates}
      candidateCount={studentsQuery.data?.meta.total}
      candidatesLoading={studentsQuery.isLoading}
      open={promoteOpen}
      onOpenChange={(open) => {
        setPromoteOpen(open)
        if (!open) {
          setPromoteSearch('')
          setPromoteSearchInput('')
          setPromotePage(1)
          setPromoteCandidates([])
        }
      }}
      onSearchChange={handlePromoteSearch}
      hasMore={promotePage < (studentsQuery.data?.meta.total_pages ?? 1)}
      isLoadingMore={studentsQuery.isFetching && !studentsQuery.isLoading}
      onLoadMore={() => setPromotePage((current) => current + 1)}
      onConfirm={handlePromoteStudent}
    />
  )

  return (
    <UserManagePageShell kind="mentor" isLoading={isInitialLoading} action={promoteAction}>
      <UserManagePanel
        kind="mentor"
        rows={rows}
        totalUsers={mentorsPage.meta?.total}
        isLoading={mentorsPage.isLoading}
        page={mentorsPage.page}
        totalPages={mentorsPage.totalPages}
        pageSize={mentorsPage.pageSize}
        onPageSizeChange={mentorsPage.setPageSize}
        onPageChange={mentorsPage.setPage}
        onSearch={mentorsPage.onSearch}
        onUpdateRole={mentorsPage.onUpdateRole}
        onDeleteUser={mentorsPage.onDeleteUser}
        isMutating={mentorsPage.isMutating}
      />
    </UserManagePageShell>
  )
}
