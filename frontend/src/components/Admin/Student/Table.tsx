import { useState } from 'react'
import { Users2 } from 'lucide-react'

import { UserManageActions } from '@/components/Admin/shared/UserManageActions'
import type { ManagedUsersTableControls } from '@/components/Admin/shared/managed-users-table-props'
import { SearchForm } from '../../shared/SearchForm'
import { EmptyState } from '../../shared/EmptyState'
import { Button } from '../../ui/button'
import { cn } from '../../../lib/utils'
import { Link } from 'react-router-dom'
import { Pagination } from '../../shared/Pagination'
import type { AdminStudent } from '../../../lib/types/user'
import { formatLearningProgressLabel, toLearningProgressPercent } from '@/lib/learning/progress'

function ProgressCell({ value }: { value: number }) {
  const progressPercent = toLearningProgressPercent(value)
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-slate-600 tabular-nums">{formatLearningProgressLabel(value)}</span>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-primary transition-[width] duration-200" style={{ width: `${progressPercent}%` }} />
      </div>
    </div>
  )
}

type TableManagementUsersProps = ManagedUsersTableControls & {
  studentData: AdminStudent[]
}

export function TableManagementUsers({
  studentData,
  isLoading = false,
  page,
  totalPages,
  onPageChange,
  onSearch,
  onUpdateRole,
  onDeleteUser,
  isMutating = false,
}: TableManagementUsersProps) {
  const [search, setSearch] = useState('')

  return (
    <div className="flex flex-col gap-5">
      <SearchForm
        value={search}
        onChange={(value) => {
          setSearch(value)
          if (value === '') onSearch('')
        }}
        onSubmit={() => onSearch(search)}
        placeholder="Cari nama, email, atau ID siswa..."
        submitLabel="Cari"
        className="w-full max-w-3xl"
      />

      {isLoading ? (
        <p className="text-sm text-slate-500">Memuat daftar siswa...</p>
      ) : studentData.length === 0 ? (
        <EmptyState
          icon={<Users2 className="h-5 w-5" />}
          title="Belum ada siswa"
          description="Tidak ada siswa yang cocok dengan filter saat ini."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch('')
                onSearch('')
                onPageChange(1)
              }}
            >
              Reset filter
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {studentData.map((student) => (
            <article key={student.uid} className={cn('flex h-full flex-col gap-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs')}>
              <div className="flex items-start gap-3">
                <div className="relative size-12 shrink-0 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-100">
                  <img src={student.avatar} alt={student.name} className="object-cover" sizes="48px" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-slate-900">{student.name}</h3>
                  <p className="truncate text-xs text-slate-500">{student.email}</p>
                </div>
                <UserManageActions
                  uid={student.uid}
                  name={student.name}
                  roleTargets={['mentor', 'admin']}
                  onUpdateRole={onUpdateRole}
                  onDeleteUser={onDeleteUser}
                  disabled={isMutating}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 rounded-2xl bg-slate-50/70 p-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Kursus</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900 tabular-nums">{student.enrolledCourses}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Rata-rata progres</p>
                  <div className="mt-1">
                    <ProgressCell value={student.averageProgress} />
                  </div>
                </div>
              </div>

              <div className="mt-auto flex items-center justify-between gap-3">
                <p className="text-xs text-slate-500">Bergabung {student.joinedAt}</p>
                <Button asChild variant="outline" size="sm" className="h-9 rounded-xl border-slate-200 px-4 text-xs font-semibold text-slate-700 shadow-none hover:bg-slate-50">
                  <Link to={`/admin/users/students/${student.uid}`}>Detail</Link>
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
