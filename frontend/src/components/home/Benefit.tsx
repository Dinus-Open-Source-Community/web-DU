import { IProgramFeatures } from "@/lib/types";

export default function ({
  DataFeatures,
}: {
  DataFeatures: IProgramFeatures[];
}) {
  return (
    <section className="relative mb-15 h-full w-full bg-muted">
      <div className="container mx-auto flex h-full w-full items-center justify-between gap-20 px-20">
        <div className="w-full max-w-sm">
          <h1 className="text-[44px] leading-[1.3] font-semibold text-black">
            Keunggulan Belajar Bersama Kami
          </h1>
          <p className="text-base font-normal text-[#383838]">
            Dapatkan pengalaman belajar yang berbeda dengan fokus pada
            penguasaan skill nyata yang siap kamu terapkan langsung di dunia
            kerja maupun proyek open source.
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
          {DataFeatures.map((feature, index) => (
            <div
              key={index}
              className="flex w-full items-start gap-3 space-y-1.5"
            >
              <div className="rounded-full bg-[#0A84DC33] p-2">
                {feature.icon}
              </div>
              <div>
                <h3 className="text-lg leading-snug font-semibold text-black">
                  {feature.title}
                </h3>
                <p className="text-sm leading-[1.3] font-normal text-[#383838]">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
