'use client'

import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'

type Crumb = { label: string; href?: string }

function buildCrumbs(pathname: string, courseUid: string): Crumb[] {
  const crumbs: Crumb[] = [
    { label: 'Courses', href: '/admin/courses' },
    { label: 'Detail Kursus', href: `/admin/courses/${courseUid}` },
  ]

  if (pathname.endsWith('/edit')) {
    crumbs.push({ label: 'Editor' })
  } else if (pathname.endsWith('/delete')) {
    crumbs.push({ label: 'Hapus' })
  } else {
    crumbs[crumbs.length - 1] = { label: 'Detail Kursus' }
  }

  return crumbs
}

export default function AdminCourseDetailLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const params = useParams<{ courseUid: string }>()
  const courseUid = Array.isArray(params.courseUid) ? params.courseUid[0] : params.courseUid

  const crumbs = buildCrumbs(pathname, courseUid)

  return (
    <div className="flex flex-col gap-6">
      <nav aria-label="Breadcrumb" className="-mx-6 -mt-6 px-6 py-3 backdrop-blur-sm">
        <ol className="flex items-center gap-1.5 text-sm">
          <li className="flex items-center">
            <Link href="/admin/dashboard" className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
              <Home className="size-3.5" />
            </Link>
          </li>
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1
            return (
              <li key={index} className="flex items-center gap-1.5">
                <ChevronRight className="size-3 text-slate-300" />
                {isLast || !crumb.href ? (
                  <span className="font-medium text-slate-800">{crumb.label}</span>
                ) : (
                  <Link href={crumb.href} className="text-slate-500 transition-colors hover:text-slate-800">
                    {crumb.label}
                  </Link>
                )}
              </li>
            )
          })}
        </ol>
      </nav>

      {children}
    </div>
  )
}
