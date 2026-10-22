import { CalendarDays, Clock, ExternalLink, MapPin, Users, Video } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { Link } from 'react-router-dom'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { MentorCalendarEvent } from '@/lib/func/calendar'
import { formatTime } from '@/lib/func/calendar'
import { ROUTES } from '@/lib/routes'

interface SessionDetailModalProps {
  session: MentorCalendarEvent | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SessionDetailModal({
  session,
  open,
  onOpenChange,
}: SessionDetailModalProps) {
  if (!session) return null

  const isOnline = session.resource.classType === 'online'
  const isUrlLocation =
    typeof session.resource.location === 'string' &&
    (session.resource.location.startsWith('http://') ||
      session.resource.location.startsWith('https://'))

  const formattedDate = format(session.start, 'EEEE, d MMMM yyyy', { locale: id })
  const coursePath = session.resource.courseId
    ? `${ROUTES.dashboardMenu.courses}/${session.resource.courseId}`
    : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 overflow-hidden rounded-2xl p-0 shadow-paper sm:max-w-lg">
        {/* Header */}
        <div className="border-b border-line-light bg-paper-paper/40 p-5 sm:p-6">
          <DialogHeader className="text-left">
            <DialogTitle className="font-headline text-lg font-bold tracking-tight text-ink-900 sm:text-xl">
              {session.title}
            </DialogTitle>
            <DialogDescription className="mt-1 flex items-center gap-1.5 text-xs font-medium text-ink-500">
              <CalendarDays className="size-3.5 text-ink-400" aria-hidden />
              <span>{formattedDate}</span>
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Content Tiles */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Waktu */}
            <div className="rounded-xl border border-line-light bg-paper-white p-3.5 space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-ink-500">
                <Clock className="size-3.5 text-brand-blue" aria-hidden />
                <span>Waktu Pelaksanaan</span>
              </div>
              <p className="font-mono text-sm font-bold text-ink-900">
                {formatTime(session.start)} – {formatTime(session.end)} WIB
              </p>
            </div>

            {/* Peserta */}
            <div className="rounded-xl border border-line-light bg-paper-white p-3.5 space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-ink-500">
                <Users className="size-3.5 text-brand-blue" aria-hidden />
                <span>Peserta Terdaftar</span>
              </div>
              <p className="text-sm font-bold text-ink-900">
                {session.resource.studentCount} Siswa Aktif
              </p>
            </div>

            {/* Moda Kelas */}
            <div className="rounded-xl border border-line-light bg-paper-white p-3.5 space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-ink-500">
                {isOnline ? (
                  <Video className="size-3.5 text-brand-blue" aria-hidden />
                ) : (
                  <MapPin className="size-3.5 text-amber-600" aria-hidden />
                )}
                <span>Moda Kelas</span>
              </div>
              <p className="text-sm font-bold text-ink-900 capitalize">
                {isOnline ? 'Kelas Online' : 'Kelas Tatap Muka (Offline)'}
              </p>
            </div>

            {/* Lokasi / Tautan */}
            <div className="rounded-xl border border-line-light bg-paper-white p-3.5 space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-ink-500">
                {isOnline ? (
                  <Video className="size-3.5 text-brand-blue" aria-hidden />
                ) : (
                  <MapPin className="size-3.5 text-amber-600" aria-hidden />
                )}
                <span>{isOnline ? 'Tautan Sesi' : 'Lokasi Sesi'}</span>
              </div>
              {isUrlLocation ? (
                <a
                  href={session.resource.location}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-brand-blue hover:underline truncate max-w-full"
                >
                  <span className="truncate">Buka tautan sesi</span>
                  <ExternalLink className="size-3 shrink-0" aria-hidden />
                </a>
              ) : (
                <p className="text-sm font-bold text-ink-900 truncate">
                  {session.resource.location || 'Belum ditentukan'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="border-t border-line-light bg-paper-paper/30 p-4 sm:p-5 flex flex-row items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Tutup
          </Button>

          {coursePath && (
            <Button asChild size="sm" variant="default" className="gap-1.5">
              <Link to={coursePath} onClick={() => onOpenChange(false)}>
                <span>Buka Kursus</span>
                <ExternalLink className="size-3.5" aria-hidden />
              </Link>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
