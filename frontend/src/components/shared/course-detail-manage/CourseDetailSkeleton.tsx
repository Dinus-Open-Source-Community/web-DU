import { useSearchParams } from 'react-router-dom'

import { Skeleton } from '@/components/ui/skeleton'
import { getCourseDetailTabs } from '@/components/shared/course-detail-manage/CourseDetailNavTabs'
import type { CourseDetailTabValue } from '@/components/shared/course-detail-manage/CourseDetailNavTabs'
import { resolveCourseDetailTab } from '@/lib/course-detail/resolve-course-detail-tab'
import { manageDetailLayout } from '@/lib/course-detail/manage-detail-layout'

type CourseDetailSkeletonProps = {
  isAdmin: boolean
}

export function CourseDetailSkeleton({ isAdmin }: CourseDetailSkeletonProps) {
  const [searchParams] = useSearchParams()
  const activeTab = resolveCourseDetailTab(searchParams.get('tab'), isAdmin)
  const tabs = getCourseDetailTabs(isAdmin)

  return (
    <div role="status" aria-busy="true" className={`${manageDetailLayout.page} ${manageDetailLayout.pageBottomMobile}`}>
      <span className="sr-only">Memuat detail kursus</span>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-9 w-64 max-w-full" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <div className="hidden gap-2 md:flex">
          {Array.from({ length: isAdmin ? 3 : 1 }).map((_, index) => (
            <Skeleton key={index} className="h-11 w-28" />
          ))}
        </div>
      </header>

      <div className={manageDetailLayout.tabScroll}>
        <div className="inline-flex w-max items-center gap-1 rounded-lg border-2 border-ink-900/10 bg-paper-paper p-1">
          {tabs.map((tab) => (
            <Skeleton key={tab.value} className="h-9 w-20 rounded-md sm:w-24" />
          ))}
        </div>
      </div>

      <div className="min-h-[18rem] sm:min-h-[24rem]">
        <CourseDetailTabSkeleton tab={activeTab} isAdmin={isAdmin} />
      </div>
    </div>
  )
}

function CourseDetailTabSkeleton({ tab, isAdmin }: { tab: CourseDetailTabValue; isAdmin: boolean }) {
  if (tab === 'overview') {
    return (
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {Array.from({ length: isAdmin ? 7 : 6 }).map((_, index) => (
              <Skeleton key={index} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-40 w-full" />
          <div className="grid gap-6 xl:grid-cols-2">
            <Skeleton className="h-56 w-full" />
            <Skeleton className="h-56 w-full" />
          </div>
          <Skeleton className="h-52 w-full" />
        </div>
        <Skeleton className="h-72 w-full" />
      </div>
    )
  }

  if (tab === 'review') {
    return (
      <section className={`${manageDetailLayout.sectionCard} ${manageDetailLayout.sectionPadding} space-y-5`}>
        <SectionHeading />
        <Skeleton className="h-40 w-full" />
        {Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-28 w-full" />)}
      </section>
    )
  }

  if (tab === 'kurikulum') {
    return (
      <section className={manageDetailLayout.sectionCard}>
        <div className="space-y-4 border-b p-5">
          <SectionHeading />
          <div className="flex gap-6"><Skeleton className="h-4 w-20" /><Skeleton className="h-4 w-20" /></div>
        </div>
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center gap-4 border-b p-5 last:border-b-0">
            <Skeleton className="size-8 shrink-0" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="ml-auto h-8 w-16" />
          </div>
        ))}
      </section>
    )
  }

  if (tab === 'peserta' || tab === 'mentor') {
    return (
      <section className={`${manageDetailLayout.sectionCard} ${manageDetailLayout.sectionPadding} space-y-5`}>
        <SectionHeading />
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3 border-b border-line-light pb-4 last:border-0">
            <Skeleton className="size-10 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-3 w-1/2" /></div>
            <Skeleton className="h-6 w-24" />
          </div>
        ))}
      </section>
    )
  }

  return (
    <section className={`${manageDetailLayout.sectionCard} ${manageDetailLayout.sectionPadding} space-y-5`}>
      <SectionHeading />
      <Skeleton className="h-10 w-full" />
      <div className="flex gap-3"><Skeleton className="h-9 w-20" /><Skeleton className="h-9 w-20" /></div>
      {Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-24 w-full" />)}
    </section>
  )
}

function SectionHeading() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-72 max-w-full" />
    </div>
  )
}
