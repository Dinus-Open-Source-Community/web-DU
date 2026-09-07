import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import SectionHeader from '@/components/playful/SectionHeader'
import StaticCourseCard from '@/components/landing/StaticCourseCard'
import { Button } from '@/components/ui/button'
import { LANDING_COURSES } from '@/lib/landing/courses'
import { LANDING_COPY } from '@/lib/landing/copy'

/**
 * Course Section — panel tipis paper-panel, 3 kartu kursus unggulan statis.
 * Irama setelah Mentors (paper): section ini sengaja lebih redup (panel) agar
 * kartu pastel menjadi fokus.
 */
export default function CourseSection() {
  const { course } = LANDING_COPY

  return (
    <section id="kursus" className="relative overflow-hidden bg-paper-panel">
      <div className="mx-auto max-w-6xl px-6 py-24 md:px-10 md:py-32">
        <SectionHeader
          eyebrow={course.eyebrow}
          title={course.title}
          copy={course.copy}
          className="mx-auto max-w-3xl"
        />

        {/* 3 kartu kursus: 1 → 2 → 3 kolom */}
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {LANDING_COURSES.map((item, i) => (
            <StaticCourseCard key={item.title} course={item} index={i} />
          ))}
        </div>

        {/* CTA lihat semua */}
        <div className="mt-12 flex justify-center">
          <Button asChild variant="outline" size="lg" className="group/btn h-12 px-7 text-base">
            <Link to={course.allHref}>
              {course.allLabel}
              <ArrowRight className="size-5 transition-transform duration-300 group-hover/btn:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
