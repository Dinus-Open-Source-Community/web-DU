import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { listMentors } from '@/lib/data/repository'

import { MentorDetailView } from './_components/MentorDetailView'

export const metadata: Metadata = {
  title: 'Detail Mentor — Admin',
  robots: { index: false, follow: false },
}

interface PageProps {
  params: Promise<{ uid: string }>
}

export default async function AdminMentorDetailPage({ params }: PageProps) {
  const { uid } = await params
  const mentors = listMentors()
  const mentor = mentors.find((m) => m.uid === uid)

  if (!mentor) notFound()

  return <MentorDetailView mentor={mentor} />
}
