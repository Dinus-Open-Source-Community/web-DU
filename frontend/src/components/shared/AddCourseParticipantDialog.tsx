import { useCallback, useEffect, useMemo, useState } from 'react'
import { UserPlus } from 'lucide-react'

import { UserPromoteDialog } from '@/components/admin/user-manage/UserPromoteDialog'
import { useCourseCandidateStudents } from '@/hooks/use-course'
import { useAddCourseParticipants } from '@/hooks/use-course-mutations'
import { mapManagedUsers, toAdminStudent } from '@/lib/user-manage/mappers'
import { rowsToPromoteCandidates, studentToRow } from '@/lib/user-manage/view-models'

type AddCourseParticipantDialogProps = {
  courseUid: string
  triggerClassName?: string
}

export function AddCourseParticipantDialog({
  courseUid,
  triggerClassName,
}: AddCourseParticipantDialogProps) {
  const [open, setOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [candidates, setCandidates] = useState<ReturnType<typeof rowsToPromoteCandidates>>([])
  const candidatesQuery = useCourseCandidateStudents(courseUid, {
    page,
    per_page: 20,
    search: search || undefined,
  }, { enabled: open })
  const addParticipants = useAddCourseParticipants()

  const loadedCandidates = useMemo(() => {
    const rawUsers = candidatesQuery.data?.users ?? []
    const students = mapManagedUsers(rawUsers, toAdminStudent).map(studentToRow)
    return rowsToPromoteCandidates(students, 'Siswa')
  }, [candidatesQuery.data?.users])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setSearch(searchInput.trim()), 300)
    return () => window.clearTimeout(timeoutId)
  }, [searchInput])

  useEffect(() => {
    setPage(1)
    setCandidates([])
  }, [search])

  useEffect(() => {
    if (!open || !candidatesQuery.data) return
    setCandidates((current) => {
      if (page === 1) return loadedCandidates
      const existing = new Set(current.map((candidate) => candidate.uid))
      return [...current, ...loadedCandidates.filter((candidate) => !existing.has(candidate.uid))]
    })
  }, [candidatesQuery.data, loadedCandidates, open, page])

  const handleConfirm = useCallback(
    async (uids: string[]) => {
      await addParticipants.mutateAsync({
        courseUid,
        payload: { student_uids: uids },
      })
    },
    [addParticipants, courseUid],
  )

  return (
    <UserPromoteDialog
      triggerLabel="Tambah Peserta"
      triggerIcon={UserPlus}
      triggerClassName={triggerClassName}
      title="Tambah Peserta"
      description="Pilih satu atau beberapa pengguna dari daftar siswa untuk ditambahkan ke kursus ini."
      confirmLabel="Tambah Peserta"
      searchPlaceholder="Cari siswa..."
      emptyTitle={candidatesQuery.isLoading ? 'Memuat siswa...' : 'Tidak ada calon peserta'}
      emptyDescription={
        candidatesQuery.isLoading
          ? 'Mohon tunggu sebentar.'
          : 'Semua siswa sudah terdaftar pada kursus ini atau belum ada siswa terdaftar.'
      }
      footerHint={(name) => `${name} akan didaftarkan sebagai peserta kursus ini.`}
      candidates={candidates}
      candidateCount={candidatesQuery.data?.total}
      candidatesLoading={candidatesQuery.isLoading}
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) {
          setSearch('')
          setSearchInput('')
          setPage(1)
          setCandidates([])
        }
      }}
      onSearchChange={setSearchInput}
      hasMore={page < (candidatesQuery.data?.total_pages ?? 1)}
      isLoadingMore={candidatesQuery.isFetching && !candidatesQuery.isLoading}
      onLoadMore={() => setPage((current) => current + 1)}
      onConfirm={handleConfirm}
    />
  )
}
