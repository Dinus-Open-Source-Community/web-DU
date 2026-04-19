import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCourseBySlug, listMentors } from '@/lib/data/repository'
import { CheckoutClient } from './_components/CheckoutClient'

export const metadata: Metadata = {
  title: 'Checkout — Doscom University',
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function CheckoutPage({ params }: PageProps) {
  const { slug } = await params
  const course = getCourseBySlug(slug)
  if (!course) notFound()

  const mentors = listMentors()
  const mentor = mentors.find((m) => m.uid === course.mentorUid)

  return (
    <CheckoutClient
      course={{
        uid: course.uid,
        title: course.title,
        image: course.image,
        price: course.price,
        strikePrice: course.strikePrice,
        classType: course.variantBadge === 'free' ? 'Free' : course.variantBadge === 'premium' ? 'Premium' : 'Event',
        instructorName: mentor?.name ?? course.author.name,
        instructorAvatar: course.author.avatar,
      }}
    />
  )
}
