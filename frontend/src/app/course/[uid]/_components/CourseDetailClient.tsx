'use client'

import Link from 'next/link'
import { useCourseByUid } from '@/hooks/api'
import { CourseDetailLayout } from '@/components/course/detail/CourseDetailLayout'
import { Button } from '@/components/ui/button'
import { slugify } from '@/lib/func/slug'
import { formatRupiah } from '@/lib/func/format'

export default function CourseDetailClient({ uid }: { uid: string }) {
  const { data: course } = useCourseByUid(uid)

  if (!course) return null

  const title = (course.title as string) ?? ''
  const description = (course.description as string) ?? ''
  const price = (course.price as number) ?? 0
  const priceStrike = (course.price_strike as number) ?? undefined
  const coverUrl = (course.cover_url as string) ?? (course.thumbnail_url as string) ?? ''
  const category = (course.category as string) ?? ''
  const rating = (course.rating as number) ?? 0
  const enrolled = (course.enrolled_count as number) ?? 0
  const totalReviews = (course.total_reviews as number) ?? 0
  const duration = (course.duration as string) ?? ''
  const mentors = (course.mentors as { uid: string; name: string; avatar_url: string }[]) ?? []
  const mentor = mentors[0]
  const whatYouLearn = (course.what_you_learn as string[]) ?? []

  const discountLabel =
    priceStrike ? `Hemat ${Math.round(((priceStrike - price) / priceStrike) * 100)}%` : undefined
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
