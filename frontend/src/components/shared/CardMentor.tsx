import { BookOpen, Users, Star, UserX } from 'lucide-react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Link } from 'react-router-dom'
import { isCoursePublished } from '@/lib/course-detail/publish-state'
import type { ICourseItem } from '@/lib/types/course'
import { CourseCardProfiles } from './CourseCardProfiles'
import {
  resolveCourseProfiles,
} from '@/lib/course-detail/course-profile'
import { CourseLevelSignal } from './CourseLevel'
import { CourseCardCover, CourseCardCoverFrame } from './CourseCardCover'
import type { CourseApiLevel } from '@/lib/types/user'

interface CardMentorProps {
  data: ICourseItem
  onStatusClick?: (uid: string) => void
  detailHref?: string
}

const CardMentor = ({ data, onStatusClick, detailHref }: CardMentorProps) => {
  const profiles = resolveCourseProfiles(data)
  const isPublished = isCoursePublished(data)
  const image = data.thumbnail_url || data.cover_url

  return (
    <div className="group flex h-full w-full flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs transition-all duration-300 hover:border-slate-300/90 hover:shadow-sm">
      {/* 1. Course Image */}
      <CourseCardCoverFrame>
        <CourseCardCover
          src={image}
          alt={data.title}
          fill
          imgClassName="transition-transform duration-500 group-hover:scale-[1.02]"
        />

        {/* Status Badge Overlay */}
        <div className="absolute top-3 right-3">
          <Badge
            variant={isPublished ? 'coursePublished' : 'courseDraft'}
            className="rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest shadow-xs border-none bg-white/95 backdrop-blur-sm">
            {isPublished ? 'Terbit' : 'Draft'}
          </Badge>
        </div>
      </CourseCardCoverFrame>

      {/* 2. Content Body */}
      <div className="flex flex-1 flex-col p-5 ">
        <div className="mb-4 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2 ">
            <CourseLevelSignal level={data.level as CourseApiLevel} />
            <div className="flex items-center gap-1">
              <Star className="size-3 fill-amber-400 text-amber-400" />
              <span className="text-xs font-bold text-slate-900">{data.rating || '0.0'}</span>
            </div>
          </div>
          <h3 className="line-clamp-2 text-base font-bold leading-snug text-slate-900">{data.title}</h3>
          <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">{data.description || data.subtitle}</p>
        </div>

        {/* 3. Stats and Actions */}
        <div className="mt-auto space-y-4 pt-4 border-t border-slate-50">
          <div className="flex items-center gap-4 text-[11px] font-medium text-slate-500">
            <div className="flex items-center gap-1.5">
              <Users className="size-3.5 text-slate-400" />
              <span className="tabular-nums">{data.slot ?? 0} Slot</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BookOpen className="size-3.5 text-slate-400" />
              <span className="tabular-nums">{data.total_reviews ?? 0} Review</span>
            </div>
          </div>

          <div className="flex justify-between items-center gap-2 pt-1">
            {profiles.length > 0 ? (
              <CourseCardProfiles profiles={profiles} />
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                <UserX className="size-3.5" />
                <span>Belum ada mentor</span>
              </div>
            )}
            {detailHref && (
              <Button variant="default" size="sm" className="rounded-xl px-3 py-2">
                <Link to={detailHref}>Kelola Kursus</Link>
              </Button>
            )}
            {onStatusClick && (
              <Button
                onClick={() => onStatusClick(data.uid)}
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-lg border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-900"
                title="Update Status">
                <Star className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CardMentor
