import { useEffect, useState, type ReactNode } from 'react'
import { GraduationCap, Loader2, ShieldCheck, UserRound, UsersRound } from 'lucide-react'
import type { ICourseMentorItem } from '@/lib/types/user'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { AdminMetaLabel } from '@/lib/admin/status-label'
import { Button } from '../ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { ConfirmDialog } from './ConfirmDialog'
import { Pagination } from './Pagination'
import { CourseDetailTabSectionIntro } from '@/components/shared/course-detail-manage/CourseDetailTabSectionIntro'
import { manageDetailLayout } from '@/lib/course-detail/manage-detail-layout'
import { cn } from '@/lib/utils'
import { useCourseMentors } from '@/hooks/use-course'

interface CourseMentorTableProps {
  courseUid?: string
  mentors: ICourseMentorItem[]
  isAdmin?: boolean
  assignAction?: ReactNode
  pendingUnassignMentor?: ICourseMentorItem | null
  onRequestUnassignMentor?: (mentor: ICourseMentorItem) => void
  onCancelUnassignMentor?: () => void
  onConfirmUnassignMentor?: () => void | Promise<void>
  unassigningMentorUid?: string | null
}

function MentorIdentity({ mentor, size = 'default' }: { mentor: ICourseMentorItem; size?: 'default' | 'compact' }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar className={size === 'compact' ? 'size-10' : 'size-11'}>
        <AvatarImage src={mentor.avatar_url || '/Logo.svg'} alt={mentor.name} />
        <AvatarFallback className="bg-muted text-muted-foreground">
          <UserRound className="size-4" />
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate text-sm font-semibold leading-5 text-foreground">{mentor.name}</p>
          {mentor.is_verified ? <ShieldCheck className="size-4 shrink-0 text-emerald-600" aria-label="Mentor terverifikasi" /> : null}
        </div>
        <p className="mt-0.5 truncate text-xs leading-5 text-muted-foreground">{mentor.email}</p>
      </div>
    </div>
  )
}

function UnassignMentorButton({
  mentor,
  onRequestUnassignMentor,
  unassigningMentorUid,
  className,
}: {
  mentor: ICourseMentorItem
  onRequestUnassignMentor: (mentor: ICourseMentorItem) => void
  unassigningMentorUid?: string | null
  className?: string
}) {
  const isUnassigning = unassigningMentorUid === mentor.uid

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={className}
      onClick={() => onRequestUnassignMentor(mentor)}
      disabled={Boolean(unassigningMentorUid)}
      aria-busy={isUnassigning}
    >
      {isUnassigning ? 'Melepas...' : 'Lepas'}
    </Button>
  )
}

export function CourseMentorTable({
  courseUid,
  mentors,
  isAdmin,
  assignAction,
  pendingUnassignMentor,
  onRequestUnassignMentor,
  onCancelUnassignMentor,
  onConfirmUnassignMentor,
  unassigningMentorUid,
}: CourseMentorTableProps) {
  const canUnassign = isAdmin && Boolean(onRequestUnassignMentor)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    setCurrentPage(1)
  }, [courseUid])

  const { data: mentorsResponse, isLoading, isFetching } = useCourseMentors(
    courseUid ?? '',
    courseUid ? { page: currentPage, per_page: 8 } : undefined,
  )

  const displayedMentors: ICourseMentorItem[] =
    mentorsResponse?.mentors ?? (courseUid ? [] : mentors)

  const totalCount =
    mentorsResponse?.meta?.total ?? mentors.length

  const totalPages =
    mentorsResponse?.meta?.total_pages ??
    Math.max(1, Math.ceil(totalCount / 8))

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages)
  }, [currentPage, totalPages])

  return (
    <>
      <CourseDetailTabSectionIntro
        className="mb-5"
        icon={GraduationCap}
        title="Tim mentor"
        description="Lihat mentor yang ditugaskan untuk mengajar kursus ini."
        aside={
          <div className={manageDetailLayout.tabCountBadge}>
            <span className={manageDetailLayout.tabCountDot} aria-hidden />
            <span>Total</span>
            <span className={manageDetailLayout.tabCountNumber}>{totalCount}</span>
            <span>mentor</span>
            {isFetching && !isLoading ? (
              <Loader2 className="size-3.5 animate-spin text-ink-400" aria-label="Memuat data..." />
            ) : null}
          </div>
        }
      />

      {isAdmin && assignAction ? <div className="mb-4 flex justify-end">{assignAction}</div> : null}

      <section className={manageDetailLayout.tableSurface}>
      {isLoading && !mentorsResponse && courseUid ? (
        <div className="flex h-48 items-center justify-center text-sm text-ink-500">
          <Loader2 className="mr-2 size-5 animate-spin text-brand-blue" />
          Memuat data mentor...
        </div>
      ) : displayedMentors.length === 0 ? (
        <div className="px-4 py-10 text-center sm:px-5">
          <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <UsersRound className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Belum ada mentor</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">Tugaskan mentor agar peserta tahu siapa pengajar kursus ini.</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className={manageDetailLayout.tableHeaderRow}>
                  <TableHead className={cn('px-5 py-3', manageDetailLayout.tableHead)}>Nama mentor</TableHead>
                  <TableHead className={cn('px-5 py-3', manageDetailLayout.tableHead)}>Peran di kursus</TableHead>
                  <TableHead className={cn('px-5 py-3', manageDetailLayout.tableHead)}>Deskripsi</TableHead>
                  {canUnassign ? (
                    <TableHead className={cn('px-5 py-3 text-right', manageDetailLayout.tableHead)}>Kelola</TableHead>
                  ) : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedMentors.map((mentor) => (
                  <TableRow key={mentor.uid} className={manageDetailLayout.tableBodyRow}>
                    <TableCell className="max-w-72 px-5 py-4">
                      <MentorIdentity mentor={mentor} />
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <AdminMetaLabel>{mentor.role || 'Mentor'}</AdminMetaLabel>
                    </TableCell>
                    <TableCell className="max-w-md px-5 py-4">
                      <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">{mentor.description || 'Belum ada deskripsi mentor.'}</p>
                    </TableCell>
                    {canUnassign ? (
                      <TableCell className="px-5 py-4 text-right">
                        <UnassignMentorButton
                          mentor={mentor}
                          onRequestUnassignMentor={onRequestUnassignMentor!}
                          unassigningMentorUid={unassigningMentorUid}
                          className="h-8 rounded-xl border-line-light px-3 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                        />
                      </TableCell>
                    ) : null}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="divide-y divide-border md:hidden">
            {displayedMentors.map((mentor) => (
              <article key={mentor.uid} className="px-4 py-4">
                <MentorIdentity mentor={mentor} size="compact" />
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <AdminMetaLabel>{mentor.role || 'Mentor'}</AdminMetaLabel>
                  {mentor.is_verified ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                      <ShieldCheck className="size-3.5" />
                      Terverifikasi
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{mentor.description || 'Belum ada deskripsi mentor.'}</p>
                {canUnassign ? (
                  <UnassignMentorButton
                    mentor={mentor}
                    onRequestUnassignMentor={onRequestUnassignMentor!}
                    unassigningMentorUid={unassigningMentorUid}
                    className="mt-4 h-9 w-full rounded-xl border-line-light text-sm font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                  />
                ) : null}
              </article>
            ))}
          </div>
        </>
      )}
      </section>

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            variant={isAdmin ? 'admin' : 'default'}
          />
        </div>
      )}

      {pendingUnassignMentor ? (
        <ConfirmDialog
          open
          onOpenChange={(open) => {
            if (!open) onCancelUnassignMentor?.()
          }}
          title="Lepas mentor dari kursus?"
          description={`${pendingUnassignMentor.name} tidak lagi ditugaskan untuk kursus ini.`}
          confirmLabel="Lepas mentor"
          cancelLabel="Batal"
          variant="destructive"
          onConfirm={() => void onConfirmUnassignMentor?.()}
          onCancel={() => onCancelUnassignMentor?.()}
        />
      ) : null}
    </>
  )
}
