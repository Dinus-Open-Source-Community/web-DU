import CardCourse from '../shared/CardCourse'
import { ROUTES } from '@/lib/routes'
import type { ICourseItem } from '@/lib/types/course'

type FeatureProps = {
  courses: ICourseItem[]
  isLoading?: boolean
}

export default function Feature({ courses, isLoading = false }: FeatureProps) {
  return (
    <section className="relative z-10 h-full w-full bg-muted">
      <div className="container mx-auto pt-25 pb-15 2xl:px-0">
        <div className="mx-auto h-full w-full max-w-3xl">
          <h2 className="text-center text-5xl leading-[1.3] font-bold">Featured Courses</h2>
          <p className="mt-4 text-center text-xl leading-[1.3] font-normal text-[#383838]">
            Jelajahi berbagai materi pembelajaran yang dikembangkan bersama komunitas open source. Di sini, kamu tidak hanya belajar teori, tapi juga terlibat dalam proyek nyata yang membantu kamu
            membangun portofolio yang solid.
          </p>
        </div>

        <div className="mt-12 grid w-full grid-cols-1 gap-8 px-6 md:grid-cols-2 md:px-12 lg:grid-cols-3 lg:px-20">
          {isLoading &&
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`featured-skeleton-${index}`}
                className="flex h-[420px] animate-pulse flex-col overflow-hidden rounded-xl bg-white"
                aria-hidden
              >
                <div className="aspect-video w-full bg-slate-200" />
                <div className="flex grow flex-col gap-3 p-5">
                  <div className="h-5 w-2/3 rounded bg-slate-200" />
                  <div className="h-4 w-full rounded bg-slate-100" />
                  <div className="h-4 w-5/6 rounded bg-slate-100" />
                  <div className="mt-auto h-10 w-full rounded bg-slate-100" />
                </div>
              </div>
            ))}

          {!isLoading && courses.length === 0 && (
            <p className="col-span-full text-center text-base text-slate-500">
              Belum ada kursus unggulan yang tersedia saat ini.
            </p>
          )}

          {!isLoading &&
            courses.map((course) => (
              <CardCourse
                key={course.uid}
                data={{
                  ...course,
                  detailHref: ROUTES.courseDetail(course.uid),
                }}
              />
            ))}
        </div>
      </div>
    </section>
  )
}
