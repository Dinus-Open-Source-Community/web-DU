import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { listStudents } from '@/lib/data/repository'

import { StudentDetailView } from './_components/StudentDetailView'

export const metadata: Metadata = {
  title: 'Detail Siswa — Admin',
  robots: { index: false, follow: false },
}

interface PageProps {
  params: Promise<{ uid: string }>
}

export default async function AdminStudentDetailPage({ params }: PageProps) {
  const { uid } = await params
  const students = listStudents()
  const student = students.find((s) => s.uid === uid)

  if (!student) notFound()

  return <StudentDetailView student={student} />
}
