import { useMemo, useState } from 'react'
import { Shield, UserPlus } from 'lucide-react'
import { SearchForm } from '../../shared/SearchForm'
import { EmptyState } from '../../shared/EmptyState'
import { cn } from '../../../lib/utils'
import { Pagination } from '../../shared/Pagination'
import type { AdminAdministrator, AdminMentor } from '../../../lib/types/api'
import type { PersonSelectionItem } from '../../../lib/types/utils'
import { Badge } from '../../ui/badge'
import { toast } from 'sonner'
import { PersonSelectionDialog } from '../../shared/PersonSelection'
import type { AdminStudent } from '../../../lib/types/user'

const PAGE_SIZE = 10

type InvitePersonItem = PersonSelectionItem & {
  kind: 'student' | 'mentor'
}

export function AdministratorsTable({ dataAdmin, dataMentors, dataStudents }: { dataAdmin: AdminAdministrator[]; dataMentors: AdminMentor[]; dataStudents: AdminStudent[] }) {
  const mentorItems: InvitePersonItem[] = dataMentors.map((mentor) => ({
    uid: mentor.uid,
    name: mentor.name,
    email: mentor.email,
    avatar: mentor.avatar,
    kind: 'mentor',
    detail: `${mentor.status} • bergabung ${mentor.joinedAt}`,
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

  const [search, setSearch] = useState('')
  const [committedSearch, setCommittedSearch] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = committedSearch.toLowerCase().trim()
    return dataAdmin.filter((a) => {
      const matchQuery = q === '' || a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || a.uid.toLowerCase().includes(q)
      return matchQuery
    })
  }, [dataAdmin, committedSearch])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pagedRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <>
      <div className="flex flex-col gap-5  p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="flex flex-row justify-between items-center gap-3">
          <SearchForm
            value={search}
            onChange={(v) => {
              setSearch(v)
              if (v === '') {
                setCommittedSearch('')
                setPage(1)
              }
            }}
            onSubmit={() => {
              setCommittedSearch(search)
              setPage(1)
            }}
            placeholder="Cari nama atau email admin..."
            submitLabel="Cari"
            className="w-full max-w-3xl"
          />

          <PersonSelectionDialog<InvitePersonItem>
            triggerLabel="Undang Admin"
            triggerIcon={UserPlus}
            title="Undang Administrator"
            description="Cari user yang ingin dijadikan administrator. Daftar menampilkan seluruh admin dan student agar mudah menelusuri kandidat yang tepat."
            confirmLabel="Kirim undangan"
            searchPlaceholder="Cari nama, email, atau ID user..."
            items={items}
            emptyTitle="Tidak ada user cocok"
            emptyDescription="Coba ubah kata kunci pencarian untuk melihat kandidat lain."
            renderFooterHint={(item) =>
              item.kind === 'student' ? (
                <span>
                  <strong className="font-semibold text-slate-900">{item.name}</strong> akan menerima undangan dan akses administrator baru.
                </span>
              ) : (
                <span>
                  <strong className="font-semibold text-slate-900">{item.name}</strong> sudah berstatus admin; undangan ulang tetap bisa diproses bila diperlukan.
                </span>
              )
            }
            onConfirm={async (item) => {
              if (item.kind === 'student') {
                toast.success(`${item.name} dipilih untuk diundang menjadi admin.`)
                return
              }

              toast.success(`${item.name} dipilih untuk pengelolaan admin.`)
            }}
          />
        </div>

        {pagedRows.length === 0 ? (
          <EmptyState icon={<Shield className="h-5 w-5" />} title="Belum ada administrator" description="Undang administrator baru untuk mulai mengelola sistem." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {pagedRows.map((admin) => (
              <article key={admin.uid} className={cn('flex h-full flex-col gap-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs')}>
                <div className="flex items-start gap-3">
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-100">
                    <img src={admin.avatar} alt={admin.name} className="object-cover" sizes="48px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-slate-900">{admin.name}</h3>
                    <p className="truncate text-xs text-slate-500">{admin.email}</p>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50/70 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Bergabung</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{admin.createdAt}</p>
                </div>
              </article>
            ))}
          </div>
        )}

        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </>
  )
}
