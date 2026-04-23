'use client'

import { useCourses } from '@/hooks/api'
import type { ICardData } from '@/lib/types'
import CourseSection1 from './Section1'

export default function CourseCatalogClient() {
  const { data } = useCourses()

  const courses: ICardData[] = (data?.courses ?? []).map((c) => ({
    uid: (c.uid as string) ?? '',
    variantBadge: ((c.is_premium ? 'premium' : 'free') as ICardData['variantBadge']),
    title: (c.title as string) ?? '',
    description: (c.description as string) ?? '',
    category: (c.category as string) ?? undefined,
    author: {
      name: ((c.mentors as { name: string }[])?.[0]?.name as string) ?? 'Mentor',
      avatar: ((c.mentors as { avatar_url: string }[])?.[0]?.avatar_url as string) ?? '',
    },
    rating: (c.rating as number) ?? 0,
    totalReviews: (c.total_reviews as number) ?? 0,
    image: (c.cover_url as string) ?? (c.thumbnail_url as string) ?? '',
    price: (c.price as number) ?? 0,
    status: (c.status as ICardData['status']) ?? 'published',
    mentorUid: ((c.mentors as { uid: string }[])?.[0]?.uid as string) ?? '',
    enrolled: (c.enrolled_count as number) ?? 0,
    modules: [],
    duration: (c.duration as string) ?? '',
    strikePrice: (c.price_strike as number) ?? undefined,
    createdAt: (c.created_at as string) ?? '',
    updatedAt: (c.updated_at as string) ?? '',
  }))

  return <CourseSection1 Data={courses} />
}
