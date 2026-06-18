import type { LandingCommunityStat } from '@/hooks/landing/use-landing-community-stats'

type CommunityProps = {
  stats: LandingCommunityStat[]
  isLoading?: boolean
}

export default function Community({ stats, isLoading = false }: CommunityProps) {
  return (
    <section className="bg-primary relative h-full w-full overflow-hidden">
      <div className="container mx-auto flex h-full w-full items-center gap-6 px-20 py-20 pb-20">
        <div className="flex w-full max-w-[460] flex-col">
          <h3 className="mb-3 text-[44px] leading-[1.3] font-semibold text-white">
            Dampak Nyata untuk Komunitas IT.
          </h3>
          <p className="text-opacity-90 text-base font-normal text-white lg:text-lg">
            Ribuan mahasiswa telah bergabung untuk meningkatkan keahlian teknis mereka. Kami bangga
            menjadi bagian dari perjalanan karier talenta digital Indonesia.
          </p>
          <div className="mt-12 flex w-full flex-wrap gap-5">
            {isLoading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <div key={`community-stat-skeleton-${index}`} className="min-w-28 animate-pulse">
                    <div className="mx-auto h-8 w-20 rounded bg-white/20" />
                    <div className="mx-auto mt-2 h-4 w-24 rounded bg-white/10" />
                  </div>
                ))
              : stats.map((stat) => (
                  <div key={stat.id}>
                    <h3 className="text-center text-3xl font-bold text-white">{stat.value}</h3>
                    <p className="text-sm font-normal text-white">{stat.label}</p>
                  </div>
                ))}
          </div>
        </div>

        <div className="relative flex w-full items-end justify-end">
          <img
            src="https://picsum.photos/650/550"
            alt="Dokumentasi kegiatan anggota komunitas IT"
            width={650}
            height={550}
            loading="lazy"
            className="bg-neutral-[#D9D9D9] h-[550px] w-[650px] max-w-full rounded-[12px] object-cover sm:h-full sm:w-full lg:h-[550px] lg:w-[650px]"
          />
          <img
            src="/pinguin.png"
            alt="Maskot Pinguin"
            width={250}
            height={250}
            className="pointer-events-none absolute -right-30 -bottom-8 z-10 select-none"
          />
        </div>
      </div>
    </section>
  )
}
