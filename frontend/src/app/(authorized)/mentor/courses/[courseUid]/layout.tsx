'use client'

import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { ChevronRight } from 'lucide-react'

function resolveSegmentLabel(pathname: string): string | null {
  if (pathname.endsWith('/edit')) return 'Editor'
  if (pathname.endsWith('/preview')) return 'Preview'
  if (pathname.endsWith('/assignments')) return 'Tugas'
  return null
}

export default function CourseDetailLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const params = useParams<{ courseUid: string }>()
  const courseUid = Array.isArray(params.courseUid) ? params.courseUid[0] : params.courseUid

  const segmentLabel = resolveSegmentLabel(pathname)
  const isSubPage = segmentLabel !== null

  return (
    <div className="flex flex-col gap-0">
      {isSubPage && (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 px-4 pt-2 text-xs text-slate-500 sm:px-6 lg:px-8">
          <Link href="/mentor/courses" className="transition-colors hover:text-slate-900">
            Courses
          </Link>
          <ChevronRight className="size-3 opacity-50" />
          <Link href={`/mentor/courses/${courseUid}`} className="transition-colors hover:text-slate-900">
            Detail Kursus
          </Link>
          <ChevronRight className="size-3 opacity-50" />
          <span className="font-medium text-slate-700">{segmentLabel}</span>
        </nav>
      )}
      {children}
    </div>
  )
}
