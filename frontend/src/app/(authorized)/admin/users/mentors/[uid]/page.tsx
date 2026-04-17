import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { adminMentors } from '@/lib/data/admin-fixtures'

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
  const mentor = adminMentors.find((m) => m.uid === uid)

  if (!mentor) notFound()

  return <MentorDetailView mentor={mentor} />
}
