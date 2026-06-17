import { useState } from 'react'
import { Shield, UserPlus } from 'lucide-react'

import { UserManageActions } from '@/components/Admin/shared/UserManageActions'
import type { ManagedUsersTableControls } from '@/lib/types/components/managed-users-table-props'
import { SearchForm } from '../../shared/SearchForm'
import { EmptyState } from '../../shared/EmptyState'
import { cn } from '../../../lib/utils'
import { Pagination } from '../../shared/Pagination'
import type { AdminAdministrator, AdminMentor } from '../../../lib/types/api'
import type { PersonSelectionItem } from '../../../lib/types/utils'
import { Badge } from '../../ui/badge'
import { PersonSelectionDialog } from '../../shared/PersonSelection'
import type { AdminStudent } from '../../../lib/types/user'

type InvitePersonItem = PersonSelectionItem & {
  kind: 'student' | 'mentor'
}

type AdministratorsTableProps = ManagedUsersTableControls & {
  dataAdmin: AdminAdministrator[]
  dataMentors: AdminMentor[]
  dataStudents: AdminStudent[]
  onPromoteToAdmin: (uid: string) => Promise<void>
}

export function AdministratorsTable({
  dataAdmin,
  dataMentors,
  dataStudents,
  isLoading = false,
  page,
  totalPages,
  onPageChange,
  onSearch,
  onUpdateRole,
  onDeleteUser,
  onPromoteToAdmin,
  isMutating = false,
}: AdministratorsTableProps) {
  const [search, setSearch] = useState('')

  const mentorItems: InvitePersonItem[] = dataMentors.map((mentor) => ({
    uid: mentor.uid,
    name: mentor.name,
    email: mentor.email,
    avatar: mentor.avatar,
    kind: 'mentor',
    detail: `Bergabung ${mentor.joinedAt}`,
    meta: <Badge variant="userRole">Mentor</Badge>,
  }))

  const studentItems: InvitePersonItem[] = dataStudents.map((student) => ({
    uid: student.uid,
    name: student.name,
    email: student.email,
    avatar: student.avatar,
    kind: 'student',
    detail: `${student.enrolledCourses} kursus • progres rata-rata ${student.averageProgress}%`,
    meta: <Badge variant="userActive">Student</Badge>,
  }))

  const items = [...mentorItems, ...studentItems]

  return (
    <div className="flex flex-col gap-5 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="flex flex-row items-center justify-between gap-3">
        <SearchForm
          value={search}
          onChange={(value) => {
            setSearch(value)
            if (value === '') onSearch('')
          }}
          onSubmit={() => onSearch(search)}
          placeholder="Cari nama atau email admin..."
          submitLabel="Cari"
          className="w-full max-w-3xl"
        />

        <PersonSelectionDialog<InvitePersonItem>
          triggerLabel="Jadikan Admin"
          triggerIcon={UserPlus}
          title="Promosikan ke Administrator"
          description="Pilih mentor atau student yang akan diberi akses administrator."
          confirmLabel="Jadikan admin"
          searchPlaceholder="Cari nama, email, atau ID user..."
          items={items}
          emptyTitle="Tidak ada user cocok"
          emptyDescription="Coba ubah kata kunci pencarian untuk melihat kandidat lain."
          renderFooterHint={(item) => (
            <span>
              <strong className="font-semibold text-slate-900">{item.name}</strong> akan diubah rolenya menjadi admin.
            </span>
          )}
          onConfirm={async (item) => {
            await onPromoteToAdmin(item.uid)
          }}
        />
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Memuat daftar administrator...</p>
      ) : dataAdmin.length === 0 ? (
        <EmptyState icon={<Shield className="h-5 w-5" />} title="Belum ada administrator" description="Promosikan user untuk mulai mengelola sistem." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {dataAdmin.map((admin) => (
            <article key={admin.uid} className={cn('flex h-full flex-col gap-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs')}>
              <div className="flex items-start gap-3">
                <div className="relative size-12 shrink-0 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-100">
                  <img src={admin.avatar} alt={admin.name} className="object-cover" sizes="48px" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-slate-900">{admin.name}</h3>
                  <p className="truncate text-xs text-slate-500">{admin.email}</p>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{admin.role}</p>
                </div>
                <UserManageActions
                  uid={admin.uid}
                  name={admin.name}
                  roleTargets={['mentor', 'student']}
                  onUpdateRole={onUpdateRole}
                  onDeleteUser={onDeleteUser}
                  disabled={isMutating}
                />
              </div>

              <div className="rounded-2xl bg-slate-50/70 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Bergabung</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{admin.createdAt}</p>
              </div>
            </article>
          ))}
        </div>
      )}

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
  )
}
