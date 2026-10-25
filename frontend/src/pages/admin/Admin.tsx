import { useCallback, useEffect, useMemo, useState } from 'react'
import { UserPlus } from 'lucide-react'

import { UserManagePageShell } from '@/components/admin/user-manage/UserManagePageShell'
import { UserManagePanel } from '@/components/admin/user-manage/UserManagePanel'
import { UserPromoteDialog } from '@/components/admin/user-manage/UserPromoteDialog'
import { useAdminUserPage } from '@/hooks/use-admin-user-page'
import { useManagedUsers } from '@/hooks/use-managed-users'
import {
  mapManagedUsers,
  toAdminAdministrator,
  toAdminMentor,
  toAdminStudent,
} from '@/lib/user-manage/mappers'
import {
  administratorToRow,
  mentorToRow,
  rowsToPromoteCandidates,
  studentToRow,
  type PromoteCandidate,
} from '@/lib/user-manage/view-models'

export default function AdminAdministratorsPage() {
  const [promoteOpen, setPromoteOpen] = useState(false)
  const [promoteSearch, setPromoteSearch] = useState('')
  const [promoteSearchInput, setPromoteSearchInput] = useState('')
  const [promotePage, setPromotePage] = useState(1)
  const [promoteCandidates, setPromoteCandidates] = useState<PromoteCandidate[]>([])
  const adminsPage = useAdminUserPage({ role: 'admin' })
  const mentorsQuery = useManagedUsers({
    page: promotePage,
    role: 'mentor',
    per_page: 20,
    search: promoteSearch || undefined,
    sort: 'created_at',
    order: 'desc',
  }, { enabled: promoteOpen })
  const studentsQuery = useManagedUsers({
    page: promotePage,
    role: 'student',
    per_page: 20,
    search: promoteSearch || undefined,
    sort: 'created_at',
    order: 'desc',
  }, { enabled: promoteOpen })

  const rows = useMemo(
    () => mapManagedUsers(adminsPage.users, toAdminAdministrator).map(administratorToRow),
    [adminsPage.users],
  )

  const loadedCandidates = useMemo(() => {
    const mentors = mapManagedUsers(mentorsQuery.data?.users ?? [], toAdminMentor).map(mentorToRow)
    const students = mapManagedUsers(studentsQuery.data?.users ?? [], toAdminStudent).map(studentToRow)

    const mentorCandidates = rowsToPromoteCandidates(mentors, 'Mentor')
    const studentCandidates = rowsToPromoteCandidates(students, 'Siswa')

    return [...mentorCandidates, ...studentCandidates] as PromoteCandidate[]
  }, [mentorsQuery.data?.users, studentsQuery.data?.users])

  useEffect(() => {
    if (!promoteOpen || (!mentorsQuery.data && !studentsQuery.data)) return
    setPromoteCandidates((current) => {
      if (promotePage === 1) return loadedCandidates
      const existing = new Set(current.map((candidate) => candidate.uid))
      return [...current, ...loadedCandidates.filter((candidate) => !existing.has(candidate.uid))]
    })
  }, [loadedCandidates, mentorsQuery.data, promoteOpen, promotePage, studentsQuery.data])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setPromoteSearch(promoteSearchInput.trim()), 300)
    return () => window.clearTimeout(timeoutId)
  }, [promoteSearchInput])

  useEffect(() => {
    setPromotePage(1)
    setPromoteCandidates([])
  }, [promoteSearch])

  const handlePromoteToAdmin = useCallback(
    async (uids: string[]) => {
      await adminsPage.onBatchUpdateRole(uids, 'admin')
    },
    [adminsPage],
  )

  const isInitialLoading = adminsPage.isLoading && rows.length === 0

  const promoteAction = (
    <UserPromoteDialog
      triggerLabel="Jadikan Admin"
      triggerIcon={UserPlus}
      title="Jadikan Admin"
      description="Pilih satu atau beberapa pengguna dari daftar mentor atau siswa untuk dipromosikan menjadi admin."
      confirmLabel="Tetapkan sebagai Admin"
      searchPlaceholder="Cari mentor atau siswa..."
      emptyTitle="Tidak ada calon admin"
      emptyDescription="Semua pengguna yang memenuhi syarat sudah menjadi admin."
      footerHint={(name) => `${name} akan mendapatkan hak akses administratif penuh.`}
      candidates={promoteCandidates}
      candidateCount={(mentorsQuery.data?.meta.total ?? 0) + (studentsQuery.data?.meta.total ?? 0)}
      candidatesLoading={mentorsQuery.isLoading || studentsQuery.isLoading}
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
      onSearchChange={setPromoteSearchInput}
      hasMore={promotePage < Math.max(mentorsQuery.data?.meta.total_pages ?? 1, studentsQuery.data?.meta.total_pages ?? 1)}
      isLoadingMore={(mentorsQuery.isFetching || studentsQuery.isFetching) && !mentorsQuery.isLoading && !studentsQuery.isLoading}
      onLoadMore={() => setPromotePage((current) => current + 1)}
      onConfirm={handlePromoteToAdmin}
    />
  )

  return (
    <UserManagePageShell kind="admin" isLoading={isInitialLoading} action={promoteAction}>
      <UserManagePanel
        kind="admin"
        rows={rows}
        totalUsers={adminsPage.meta?.total}
        isLoading={adminsPage.isLoading}
        page={adminsPage.page}
        totalPages={adminsPage.totalPages}
        pageSize={adminsPage.pageSize}
        onPageSizeChange={adminsPage.setPageSize}
        onPageChange={adminsPage.setPage}
        onSearch={adminsPage.onSearch}
        onUpdateRole={adminsPage.onUpdateRole}
        onDeleteUser={adminsPage.onDeleteUser}
        isMutating={adminsPage.isMutating}
      />
    </UserManagePageShell>
  )
}
