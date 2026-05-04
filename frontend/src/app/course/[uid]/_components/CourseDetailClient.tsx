'use client'

import Link from 'next/link'
import { useCourseByUid } from '@/hooks/api'
import { CourseDetailLayout } from '@/components/course/detail/CourseDetailLayout'
import { Button } from '@/components/ui/button'
import { slugify } from '@/lib/func/slug'
import { formatRupiah } from '@/lib/func/format'

function pickString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function pickNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' ? value : fallback
}

function pickCategoryLabel(value: unknown): string {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && 'name' in value) {
    return pickString((value as { name?: unknown }).name)
  }
  return ''
}

export default function CourseDetailClient({ uid }: { uid: string }) {
  const { data: course } = useCourseByUid(uid)

  if (!course) return null

  const title = pickString(course.title)
  const description = pickString(course.description)
  const price = pickNumber(course.price)
  const priceStrike = typeof course.price_strike === 'number' ? course.price_strike : undefined
  const coverUrl = pickString(course.cover_url) || pickString(course.thumbnail_url)
  const category = pickCategoryLabel(course.category)
  const rating = pickNumber(course.rating)
  const enrolled = pickNumber(course.enrolled_count)
  const totalReviews = pickNumber(course.total_reviews)
  const duration = pickString(course.duration)
  const mentors = Array.isArray(course.mentors) ? (course.mentors as { uid?: string; name?: string; avatar_url?: string }[]) : []
  const mentor = mentors[0]
  const whatYouLearn = Array.isArray(course.what_you_learn) ? (course.what_you_learn as unknown[]).filter((item): item is string => typeof item === 'string') : []

  const discountLabel = priceStrike ? `Hemat ${Math.round(((priceStrike - price) / priceStrike) * 100)}%` : undefined
  const courseSlug = slugify(title)

  return (
    <CourseDetailLayout
      backHref="/course"
      backLabel="Kembali ke Katalog"
      category={category}
      title={title}
      description={description}
      rating={rating}
      studentsCount={enrolled}
      totalReviews={totalReviews}
      durationLabel={duration}
      previewImage={coverUrl}
      price={price === 0 ? 'Gratis' : formatRupiah(price)}
      strikePrice={priceStrike ? formatRupiah(priceStrike) : undefined}
      discountLabel={discountLabel}
      whatYouLearn={whatYouLearn}
      syllabus={[]}
      feedbackBreakdown={[]}
      instructor={{
        name: mentor?.name ?? 'Mentor',
        role: 'Mentor',
        avatar: mentor?.avatar_url ?? '',
      }}
      popularCourses={[]}
      popularBaseHref="/course"
      sidebarCta={
        <Button asChild className="h-11 rounded-xl text-sm font-semibold">
          <Link href={`/checkout/${courseSlug}`}>Beli Sekarang</Link>
        </Button>
      }
    />
  )
}
