import type { ReactNode } from 'react'
import { ShieldCheck, UserRound, UsersRound } from 'lucide-react'
import type { ICourseMentorItem } from '@/lib/types/user'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { ConfirmDialog } from './ConfirmDialog'

interface CourseMentorTableProps {
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
        <AvatarImage src={mentor.avatar_url || '/pinguin.png'} alt={mentor.name} />
        <AvatarFallback className="bg-slate-100 text-slate-500">
          <UserRound className="size-4" />
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate text-sm font-semibold leading-5 text-slate-950">{mentor.name}</p>
          {mentor.is_verified ? <ShieldCheck className="size-4 shrink-0 text-emerald-600" aria-label="Mentor terverifikasi" /> : null}
        </div>
        <p className="mt-0.5 truncate text-xs leading-5 text-slate-500">{mentor.email}</p>
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

  return (
    <section className="rounded-2xl border border-slate-200 bg-white">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
            <UsersRound className="size-4 text-slate-500" />
            Tim pengajar
          </div>
          <p className="mt-1 text-sm leading-6 text-slate-500">{mentors.length} mentor ditugaskan untuk kursus ini.</p>
        </div>

        {isAdmin && assignAction ? assignAction : null}
      </div>

      {mentors.length === 0 ? (
        <div className="px-4 py-10 text-center sm:px-5">
          <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
              <UsersRound className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-950">Belum ada mentor</h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">Assign mentor agar peserta tahu siapa pengajar kursus ini.</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="hidden md:block">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow className="border-slate-200 hover:bg-slate-50">
                  <TableHead className="px-5 py-3 text-xs font-semibold text-slate-500">Mentor</TableHead>
                  <TableHead className="px-5 py-3 text-xs font-semibold text-slate-500">Peran</TableHead>
                  <TableHead className="px-5 py-3 text-xs font-semibold text-slate-500">Deskripsi</TableHead>
                  {canUnassign ? <TableHead className="px-5 py-3 text-right text-xs font-semibold text-slate-500">Aksi</TableHead> : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {mentors.map((mentor) => (
                  <TableRow key={mentor.uid} className="border-slate-200 hover:bg-slate-50/70">
                    <TableCell className="max-w-72 px-5 py-4">
                      <MentorIdentity mentor={mentor} />
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <Badge variant="categoryDefault" className="rounded-lg px-2 py-1 text-xs font-semibold normal-case tracking-normal">
                        {mentor.role || 'Mentor'}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-md px-5 py-4">
                      <p className="line-clamp-2 text-sm leading-6 text-slate-600">{mentor.description || 'Belum ada deskripsi mentor.'}</p>
                    </TableCell>
                    {canUnassign ? (
                      <TableCell className="px-5 py-4 text-right">
                        <UnassignMentorButton
                          mentor={mentor}
                          onRequestUnassignMentor={onRequestUnassignMentor!}
                          unassigningMentorUid={unassigningMentorUid}
                          className="h-8 rounded-xl border-slate-200 px-3 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                        />
                      </TableCell>
                    ) : null}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="divide-y divide-slate-200 md:hidden">
            {mentors.map((mentor) => (
              <article key={mentor.uid} className="px-4 py-4">
                <MentorIdentity mentor={mentor} size="compact" />
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge variant="categoryDefault" className="rounded-lg px-2 py-1 text-xs font-semibold normal-case tracking-normal">
                    {mentor.role || 'Mentor'}
                  </Badge>
                  {mentor.is_verified ? (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                      <ShieldCheck className="size-3.5" />
                      Verified
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{mentor.description || 'Belum ada deskripsi mentor.'}</p>
                {canUnassign ? (
                  <UnassignMentorButton
                    mentor={mentor}
                    onRequestUnassignMentor={onRequestUnassignMentor!}
                    unassigningMentorUid={unassigningMentorUid}
                    className="mt-4 h-9 w-full rounded-xl border-slate-200 text-sm font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                  />
                ) : null}
              </article>
            ))}
          </div>
        </>
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
    </section>
  )
}
