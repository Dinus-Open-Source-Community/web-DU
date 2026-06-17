import { useState } from 'react'
import { UserPlus, UsersRound } from 'lucide-react'

import { UserManageActions } from '@/components/Admin/shared/UserManageActions'
import type { ManagedUsersTableControls } from '@/lib/types/components/managed-users-table-props'
import { SearchForm } from '../../shared/SearchForm'
import { EmptyState } from '../../shared/EmptyState'
import { Button } from '../../ui/button'
import { Link } from 'react-router-dom'
import { Pagination } from '../../shared/Pagination'
import type { AdminMentor } from '../../../lib/types/api'
import type { PersonSelectionItem } from '../../../lib/types/utils'
import { Badge } from '../../ui/badge'
import { PersonSelectionDialog } from '../../shared/PersonSelection'
import type { AdminStudent } from '../../../lib/types/user'

type MentorsTableProps = ManagedUsersTableControls & {
  dataMentors: AdminMentor[]
  dataStudents: AdminStudent[]
  onPromoteStudent: (uid: string) => Promise<void>
}

export function MentorsTable({
  dataMentors,
  dataStudents,
  isLoading = false,
  page,
  totalPages,
  onPageChange,
  onSearch,
  onUpdateRole,
  onDeleteUser,
  onPromoteStudent,
  isMutating = false,
}: MentorsTableProps) {
  const [search, setSearch] = useState('')

  const items: PersonSelectionItem[] = dataStudents.map((student) => ({
    uid: student.uid,
    name: student.name,
    email: student.email,
    avatar: student.avatar,
    detail: `${student.enrolledCourses} kursus • progres rata-rata ${student.averageProgress}%`,
    meta: <Badge variant="userPending">Student</Badge>,
  }))

  return (
    <div className="flex flex-col gap-5 p-5">
      <div className="flex flex-row items-center justify-between gap-3">
        <SearchForm
          value={search}
          onChange={(value) => {
            setSearch(value)
            if (value === '') onSearch('')
          }}
          onSubmit={() => onSearch(search)}
          placeholder="Cari nama, email, atau ID mentor..."
          submitLabel="Cari"
          className="w-full max-w-3xl"
        />
        <PersonSelectionDialog<PersonSelectionItem>
          triggerLabel="Promosikan Student"
          triggerIcon={UserPlus}
          title="Jadikan Mentor"
          description="Pilih student yang ingin dipromosikan menjadi mentor."
          confirmLabel="Jadikan mentor"
          searchPlaceholder="Cari nama, email, atau ID student..."
          items={items}
          emptyTitle="Tidak ada student cocok"
          emptyDescription="Coba kata kunci lain untuk menemukan student yang akan dijadikan mentor."
          renderFooterHint={(item) => (
            <span>
              <strong className="font-semibold text-slate-900">{item.name}</strong> akan diubah rolenya menjadi mentor.
            </span>
          )}
          onConfirm={async (item) => {
            await onPromoteStudent(item.uid)
          }}
        />
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Memuat daftar mentor...</p>
      ) : dataMentors.length === 0 ? (
        <EmptyState icon={<UsersRound className="h-5 w-5" />} title="Belum ada mentor" description="Tidak ada mentor yang cocok dengan filter saat ini." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {dataMentors.map((mentor) => (
            <article key={mentor.uid} className="flex h-full flex-col gap-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="relative size-12 shrink-0 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-100">
                  <img src={mentor.avatar} alt={mentor.name} className="object-cover" sizes="48px" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-slate-900">{mentor.name}</h3>
                  <p className="truncate text-xs text-slate-500">{mentor.email}</p>
                </div>
                <UserManageActions
                  uid={mentor.uid}
                  name={mentor.name}
                  roleTargets={['student', 'admin']}
                  onUpdateRole={onUpdateRole}
                  onDeleteUser={onDeleteUser}
                  disabled={isMutating}
                />
              </div>

              <div className="rounded-2xl bg-slate-50/70 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Status</p>
                <p className="mt-1 text-sm font-semibold capitalize text-slate-900">{mentor.status}</p>
              </div>

              <div className="mt-auto flex items-center justify-end gap-3">
                <Button asChild variant="outline" size="sm" className="h-9 rounded-xl border-slate-200 px-4 text-xs font-semibold text-slate-700 shadow-none hover:bg-slate-50">
                  <Link to={`/admin/users/mentors/${mentor.uid}`}>Detail</Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
  )
}
