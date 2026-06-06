import type { ICardData } from "../../lib/types/utils";
import CardCourse from "../shared/CardCourse";

export default function Feature({ Data }: { Data: ICardData[] }) {
  return (
    <section className="relative z-10 h-full w-full bg-muted">
      <div className="container mx-auto pt-25 pb-15 2xl:px-0">
        {/*header section*/}
        <div className="mx-auto h-full w-full max-w-3xl">
          <h2 className="text-center text-5xl leading-[1.3] font-bold">Featured Courses</h2>
          <p className="mt-4 text-center text-xl leading-[1.3] font-normal text-[#383838]">
            Jelajahi berbagai materi pembelajaran yang dikembangkan bersama komunitas open source. Di sini, kamu tidak hanya belajar teori, tapi juga terlibat dalam proyek nyata yang membantu kamu
            membangun portofolio yang solid.
          </p>
        </div>
        {/*card section*/}
        <div className="mt-12 grid w-full grid-cols-1 gap-8 px-20 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {Data.map((data, idx) => (
            <CardCourse
              key={data.uid ?? `${data.title}-${idx}`}
              data={{
                uid: data.uid,
                title: data.title,
                description: data.description,
                subtitle: data.subtitle,
                thumbnail_url: data.thumbnail_url,
                cover_url: data.cover_url,
                is_premium: data.is_premium,
                level: data.level,
                price: data.price,
                mentors: data.mentors,
                created_by: data.created_by,
                category_uid: data.category_uid,
                course_type_uid: data.course_type_uid,
                slug: data.slug,
                status: data.status,
                created_at: data.created_at,
                updated_at: data.updated_at,
                event_uid: data.event_uid ?? null,
                detailHref: `/course/${data.uid}`,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
