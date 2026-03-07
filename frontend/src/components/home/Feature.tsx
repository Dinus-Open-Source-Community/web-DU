import { ICardData } from "@/lib/types";
import { Card } from "../ui/card";

export default function Feature({ Data }: { Data: ICardData[] }) {
  return (
    <div className="relative z-10 h-full w-full bg-white">
      <div className="container mx-auto pt-25 pb-15 2xl:px-0">
        <div className="mx-auto h-full w-full max-w-3xl">
          <h2 className="text-center text-5xl leading-[1.3] font-bold">
            Featured Courses
          </h2>
          <p className="mt-4 text-center text-xl leading-[1.3] font-normal text-[#383838]">
            Jelajahi berbagai materi pembelajaran yang dikembangkan bersama
            komunitas open source. Di sini, kamu tidak hanya belajar teori, tapi
            juga terlibat dalam proyek nyata yang membantu kamu membangun
            portofolio yang solid.
          </p>
        </div>
        <div className="mt-12 grid w-full grid-cols-1 gap-8 px-20 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {Data.map((data, idx) => (
            <Card
              key={idx}
              variantBadge={data.variantBadge}
              title={data.title}
              description={data.description}
              author={data.author}
              rating={data.rating}
              totalReviews={data.totalReviews}
              image={data.image}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
