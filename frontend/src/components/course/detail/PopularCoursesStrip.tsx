import { cn } from '@/lib/utils'
import type { BadgeVariant } from '@/lib/types'
import { Card } from '@/components/ui/card'

export interface PopularCourseItem {
  uid: string
  title: string
  image?: string
  rating: number
  totalReviews?: number
  price: string
  mentor?: string
  mentorAvatar?: string
  description?: string
  variantBadge?: BadgeVariant
}

interface PopularCoursesStripProps {
  title?: string
  items: PopularCourseItem[]
  baseHref?: string
  className?: string
}

export function PopularCoursesStrip({
  title = 'Popular Courses',
  items,
  baseHref = '/course',
  className,
}: PopularCoursesStripProps) {
  return (
    <section
      className={cn(
        'rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]',
        className,
      )}
    >
      <h2 className="mb-5 text-lg font-semibold tracking-tight text-slate-900">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <Card
            key={item.uid}
            variant="course"
            size="sm"
            image={item.image}
            title={item.title}
            description={item.description}
            variantBadge={item.variantBadge}
            rating={item.rating}
            totalReviews={item.totalReviews ?? 0}
            price={item.price}
            detailHref={`${baseHref}/${item.uid}`}
            author={
              item.mentor
                ? {
                    name: item.mentor,
                    avatar: item.mentorAvatar ?? '/pinguin.png',
                  }
                : undefined
            }
          />
        ))}
      </div>
    </section>
  )
}
