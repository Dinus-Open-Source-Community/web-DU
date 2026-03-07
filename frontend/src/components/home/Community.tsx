import Image from "next/image";

export default function ImpactSection() {
  return (
    <section className="bg-primary relative h-full w-full overflow-hidden">
      <div className="container mx-auto flex h-full w-full items-center gap-6 px-20 py-20 pb-20">
        <div className="flex w-full max-w-[460] flex-col">
          <h3 className="mb-3 text-[44px] leading-[1.3] font-semibold text-white">
            Dampak Nyata untuk Komunitas IT.
          </h3>
          <p className="text-opacity-90 text-base font-normal text-white 2xl:text-lg">
            Ribuan mahasiswa telah bergabung untuk meningkatkan keahlian teknis
            mereka. Kami bangga menjadi bagian dari perjalanan karier talenta
            digital Indonesia.
          </p>
          <div className="mt-12 flex w-full gap-5">
            <div>
              <h3 className="text-center text-3xl font-bold text-white">
                12,345
              </h3>
              <p className="text-sm font-normal text-white">Active Student</p>
            </div>
            <div>
              <h3 className="text-center text-3xl font-bold text-white">
                12,345
              </h3>
              <p className="text-sm font-normal text-white">Active Student</p>
            </div>
            <div>
              <h3 className="text-center text-3xl font-bold text-white">
                12,345
              </h3>
              <p className="text-sm font-normal text-white">Active Student</p>
            </div>
            <div>
              <h3 className="text-center text-3xl font-bold text-white">
                12,345
              </h3>
              <p className="text-sm font-normal text-white">Active Student</p>
            </div>
          </div>
        </div>

        <div className="relative flex w-full items-end justify-end">
          <Image
            src="https://picsum.photos/650/550"
            alt="Dokumentasi kegiatan anggota komunitas IT"
            width={650}
            height={550}
            className="bg-neutral-[#D9D9D9] h-full w-full rounded-[12px] object-cover 2xl:h-[550px] 2xl:w-[650px]"
          />
          <Image
            src="/pinguin.png"
            alt="Maskot Pinguin"
            width={250}
            height={250}
            className="pointer-events-none absolute -right-30 -bottom-8 z-10 select-none"
          />
        </div>
      </div>
    </section>
  );
}
