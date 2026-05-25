import { BookOpen, Users } from 'lucide-react'
import { Badge } from '../ui/badge'
import { ReactIcon } from './icon'
import { Rating } from '../ui/rating'
import { cn } from '../../lib/utils'
import { Button } from '../ui/button'
import { Link } from 'react-router-dom'

interface ICardMentor {
  image?: string
  title: string
  description?: string
  mentorModuleCount?: number
  mentorStudentCount?: number
  rating?: number
  totalReviews?: number
  mentorOnStatusClick?: () => void
  mentorPublished?: boolean
  detailHref?: string
}

const CardMentor = ({ image, title, description, mentorModuleCount, mentorStudentCount, rating, totalReviews, mentorOnStatusClick, mentorPublished, detailHref }: ICardMentor) => {
  const isLive = mentorPublished === true
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:border-slate-300/90">
      <div className="relative aspect-16/10 w-full shrink-0">
        {image?.startsWith('data:') ? (
          <img src={image} width={384} height={256} loading="lazy" alt={title} className="h-full w-full object-cover" />
        ) : image ? (
          <img src={image} width={384} height={256} loading="lazy" alt={title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full min-h-[140px] w-full items-center justify-center bg-slate-100 text-slate-300">
            <ReactIcon />
          </div>
        )}
        <div className="absolute left-3 top-3">
          <Badge variant={isLive ? 'mentorLive' : 'mentorDraft'} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-col gap-1">
          <h3 className="line-clamp-2 text-lg font-semibold leading-snug tracking-tight text-slate-900">{title}</h3>

          {description && <p className="line-clamp-2 text-sm leading-relaxed text-slate-500">{description}</p>}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-2 text-[13px] text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <BookOpen className="h-4 w-4 text-slate-400" aria-hidden />
            <span className="font-medium tabular-nums">{mentorModuleCount ?? 0}</span>
            <span className="text-slate-400">modul</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-4 w-4 text-slate-400" aria-hidden />
            <span className="font-medium tabular-nums">{mentorStudentCount ?? 0}</span>
            <span className="text-slate-400">siswa</span>
          </span>
          <div className="ml-auto shrink-0">
            <Rating rating={rating ?? 0} totalReviews={totalReviews ?? 0} />
          </div>
        </div>

        <div className={cn('mt-auto flex flex-wrap items-stretch gap-2 border-t border-slate-100 pt-4 sm:items-center sm:justify-end', mentorOnStatusClick && 'sm:justify-between')}>
          {mentorOnStatusClick ? (
            <Button
              type="button"
              variant={isLive ? 'outline' : 'default'}
              size="sm"
              className={cn('h-9 rounded-xl px-4 text-xs font-semibold shadow-none', isLive && 'border-amber-200 bg-amber-50/80 text-amber-900 hover:bg-amber-100/90')}
              onClick={mentorOnStatusClick}>
              {isLive ? 'Jadikan draf' : 'Terbitkan'}
            </Button>
          ) : null}
          <div className="flex flex-wrap gap-2 sm:ml-auto sm:justify-end">
            {detailHref ? (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-9 rounded-xl border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-none hover:bg-slate-50 hover:text-slate-900">
                <Link to={detailHref}>Kelola kursus</Link>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CardMentor
