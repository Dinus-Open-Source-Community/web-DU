import Image from 'next/image'
import Link from 'next/link'
import { ReactIcon } from './icons'
import { Badge } from './badge'
import { Rating } from './rating'
import { BadgeVariant, PaymentStatus } from '@/lib/types'
import { Profile } from './profile'
import { Button } from './button'

interface CardProps {
  variant?: 'course' | 'resume' | 'transaction'
  image?: string
  title: string
  description?: string
  variantBadge?: BadgeVariant
  author?: {
    name: string
    avatar: string
  }
  rating?: number
  totalReviews?: number
  size?: 'sm' | 'md' | 'lg'
  module?: string
  progress?: number
  // Transaction-specific props
  transactionId?: string
  classType?: string
  price?: string
  paymentStatus?: PaymentStatus
  paymentMethod?: string
  purchasedAt?: string
  detailHref?: string
}

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

function Card({
  variant = 'course',
  image,
  title,
  description,
  variantBadge,
  author,
  rating,
  totalReviews,
  size = 'md',
  module,
  progress,
  transactionId,
  classType,
  price,
  paymentStatus,
  paymentMethod,
  purchasedAt,
  detailHref,
}: CardProps) {
  if (variant === 'transaction') {
    return (
      <div className="flex w-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:flex-row">
        {/* Left — Image */}
        <div className="relative h-48 w-full shrink-0 sm:h-auto sm:w-52 md:w-60">
          {image ? (
            <Image src={image} alt={title} fill className="object-cover" sizes="(max-width: 640px) 100vw, 240px" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-300">
              <ReactIcon />
            </div>
          )}
        </div>

        {/* Right — Content */}
        <div className="flex flex-1 flex-col justify-between p-5 md:p-6">
          {/* Top row: Badge + Status */}
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              {classType && <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">{classType}</span>}
              {transactionId && <span className="text-xs font-medium text-slate-400">{transactionId}</span>}
            </div>
            {paymentStatus && <Badge type="payment" status={paymentStatus} />}
          </div>

          {/* Title */}
          <h3 className="mb-1.5 line-clamp-2 text-base font-semibold leading-snug text-slate-900 md:text-lg">{title}</h3>

          {/* Meta info row */}
          <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-slate-500">
            {paymentMethod && (
              <span className="flex items-center gap-1">
                <span className="font-medium text-slate-400">Via</span> {paymentMethod}
              </span>
            )}
            {purchasedAt && <span>{purchasedAt}</span>}
          </div>

          {/* Bottom row: Price + Action */}
          <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
            {price && <span className="text-lg font-bold tracking-tight text-slate-900">{price}</span>}
            {detailHref && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-8 rounded-lg border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 shadow-none hover:bg-slate-50 hover:text-slate-900">
                <Link href={detailHref}>Lihat Detail</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'resume') {
    return (
      <div className="flex h-full w-full flex-col overflow-hidden drop-shadow-md transition-all hover:drop-shadow-lg duration-300">
        {/* Image Content */}
        <div className="relative aspect-video w-full shrink-0 rounded-[10px] min-h-[203px]">
          {image ? (
            <Image src={image} alt={title} loading="lazy" fill className="rounded-[10px] object-cover" sizes="(max-width: 768px) 100vw, 384px" />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#D2E1ED] text-[#00D8FF]">
              <ReactIcon />
            </div>
          )}
        </div>

        {/* Content description */}
        <div className="relative z-10 -mt-6 flex grow flex-col rounded-xl bg-white p-5 border border-slate-100/50">
          {/* Top Info (Badge & Rating) */}
          {(variantBadge || rating !== undefined) && (
            <div className="mb-3 flex items-center justify-between">
              {variantBadge && <Badge variant={variantBadge} />}
              {rating !== undefined && totalReviews !== undefined && <Rating rating={rating} totalReviews={totalReviews} />}
            </div>
          )}

          <div className="mb-4 flex flex-col">
            <h3 className="mb-1 line-clamp-2 text-lg font-bold leading-snug text-slate-900">{title}</h3>
            {module && <p className="mb-2 text-xs font-semibold text-slate-400 tracking-wide uppercase">{module}</p>}

            {description && <p className="line-clamp-2 text-sm leading-[1.4] font-normal text-slate-500">{description}</p>}
          </div>

          {/* Progress */}
          {progress !== undefined && (
            <div className="mt-auto mb-5 w-full">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Progres Belajar</span>
                <span className="text-xs font-bold text-primary">{progress}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {/* Bottom Section (Author & Action) */}
          {author && (
            <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
              <Profile image={author.avatar ?? '/pinguin.png'} name={author.name ?? ''} />
              {progress === 100 ? (
                <div className="px-3.5 py-1.5 bg-emerald-50 text-emerald-600 font-bold text-xs uppercase tracking-widest rounded-lg border border-emerald-200 ">Selesai</div>
              ) : (
                <Button className="px-5 py-2 text-sm font-semibold rounded-lg shadow-xs" variant="default" size="sm">
                  Lanjut
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`flex h-full w-full ${sizes.container[size]} flex-col overflow-hidden drop-shadow-sm transition-all hover:drop-shadow-md duration-300`}>
      {/* Image Content*/}
      <div className={`relative aspect-video w-full shrink-0 rounded-[10px] ${sizes.imageWrapper[size]}`}>
        {image ? (
          <Image src={image} alt={title} loading="lazy" fill className="rounded-[10px] object-cover" sizes="(max-width: 768px) 100vw, 384px" />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#D2E1ED] text-[#00D8FF]">
            <ReactIcon />
          </div>
        )}
      </div>

      {/* Content description */}
      <div className={`relative z-10 flex grow flex-col rounded-xl bg-white border border-slate-100/50 ${sizes.contentWrapper[size]}`}>
        {/* Top Info (Badge & Rating) */}
        {(variantBadge || rating !== undefined) && (
          <div className="mb-3 flex items-center justify-between">
            {variantBadge && <Badge variant={variantBadge} />}
            {rating !== undefined && totalReviews !== undefined && <Rating rating={rating} totalReviews={totalReviews} />}
          </div>
        )}

        <div className="mb-5 flex flex-col w-full">
          <h3 className={`mb-1.5 line-clamp-2 leading-snug font-bold text-slate-900 ${sizes.title[size]}`}>{title}</h3>
          {module && <p className="mb-2 text-xs font-semibold text-slate-400 tracking-wide uppercase">{module}</p>}

          {description && <p className={`line-clamp-2 grow leading-[1.4] font-normal text-slate-500 ${sizes.description[size]}`}>{description}</p>}
        </div>

        {/* Bottom Section (Author & Action) */}
        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
          {author ? <Profile image={author.avatar ?? '/pinguin.png'} name={author.name ?? ''} /> : <div />}

          {progress === 100 ? (
            <div className="px-3.5 py-1.5 bg-emerald-50 text-emerald-600 font-bold text-xs uppercase tracking-widest rounded-lg border border-emerald-200 shadow-sm">Selesai</div>
          ) : (
            <Button className="px-5 py-2 text-sm font-semibold rounded-lg shadow-sm" variant="default" size="sm">
              Mulai
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export { Card }
