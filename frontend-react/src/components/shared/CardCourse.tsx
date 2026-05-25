import { Link } from 'react-router-dom'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { ReactIcon } from './icon'
import type { ICardProps } from '../../lib/types/utils'
import { Rating } from '../ui/rating'
import { Profile } from '../ui/profile'

const sizes = {
  container: {
    sm: 'w-full',
    md: 'w-full',
    lg: 'w-full',
  },
  imageWrapper: {
    sm: 'min-h-[160px]',
    md: 'min-h-[203px]',
    lg: 'min-h-[250px]',
  },
  contentWrapper: {
    sm: 'min-h-[160px] p-4 -mt-6',
    md: 'min-h-[208px] p-5 -mt-6',
    lg: 'min-h-[250px] p-6 -mt-8',
  },
  title: {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
  },
  description: {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-lg',
  },
}

const CardCourse = ({ size = 'md', data }: { size?: 'sm' | 'md' | 'lg'; data: ICardProps }) => {
  return (
    <div className={`flex h-full w-full ${sizes.container[size]} flex-col overflow-hidden drop-shadow-sm transition-all hover:drop-shadow-md duration-300`}>
      {/* Image Content*/}
      <div className={`relative aspect-video w-full shrink-0 rounded-[10px] ${sizes.imageWrapper[size]}`}>
        {data.image ? (
          <img src={data.image} alt={data.title} loading="lazy" className="h-full w-full rounded-[10px] object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#D2E1ED] text-[#00D8FF]">
            <ReactIcon />
          </div>
        )}
      </div>

      {/* Content description */}
      <div className={`relative z-10 flex grow flex-col rounded-xl bg-white border border-slate-100/50 ${sizes.contentWrapper[size]}`}>
        {/* Top Info (Badge & Rating) */}
        {(data.variantBadge || data.rating !== undefined) && (
          <div className="mb-3 flex items-center justify-between">
            {data.variantBadge && <Badge variant={data.variantBadge} />}
            {data.rating !== undefined && data.totalReviews !== undefined && <Rating rating={data.rating} totalReviews={data.totalReviews} />}
          </div>
        )}

        <div className="mb-5 flex w-full flex-col gap-1.5">
          <h3 className={`mb-1 line-clamp-2 font-bold leading-tight text-slate-900 ${sizes.title[size]}`}>{data.title}</h3>
          {data.module && <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{data.module}</p>}
          <div className="flex flex-col grow">
            {data.description && <p className={`line-clamp-2 text-xs font-normal leading-[1.6] text-slate-500 ${sizes.description[size]}`}>{data.description}</p>}
            {data.price && <span className="mt-2 text-base font-semibold text-primary ">{data.price}</span>}
          </div>
        </div>

        {/* Bottom Section (Author & Action) */}
        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
          {data.author ? <Profile image={data.author.avatar ?? '/pinguin.png'} name={data.author.name ?? ''} /> : <div />}

          <div className="flex items-center gap-3">
            {data.progress === 100 ? (
              <Badge variant="progressComplete" />
            ) : data.detailHref ? (
              <Button asChild className="px-5 py-2 text-sm font-semibold rounded-lg shadow-sm" variant="default" size="sm">
                <Link to={data.detailHref}>Mulai</Link>
              </Button>
            ) : (
              <Button className="px-5 py-2 text-sm font-semibold rounded-lg shadow-sm" variant="default" size="sm">
                Mulai
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CardCourse
