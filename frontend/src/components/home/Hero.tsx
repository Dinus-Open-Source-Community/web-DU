import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SquareIcon } from "../ui/icons";

export default function Hero() {
  return (
    <div className="bg-primary/90 relative w-full py-20 md:py-32">
      <div className="container mx-auto flex items-center justify-between gap-10 px-20">
        {/*Hero Description*/}
        <div className="w-full max-w-130 space-y-2 text-start">
          <p className="text-popover text-5xl leading-[1.2] font-bold">
            Kuasai Teknologi Masa Depan Bersama Komunitas.
          </p>

          <p className="text-popover text-lg leading-[1.2] font-normal">
            Pelajari skill IT paling dicari mulai dari Web Development hingga
            Machine Learning langsung dari mentor berpengalaman di Doscom.
          </p>

          <div className="pt-5">
            <Button
              className="bg-popover text-primary rounded-[10px] px-6 py-6 text-lg leading-[1.2] font-semibold"
              variant="secondary"
            >
              Pelajari Sekarang
            </Button>
          </div>
        </div>

        {/* Hero Image */}
        <div className="pointer-events-none select-none">
          <SquareIcon className="absolute right-30 bottom-0 z-10 2xl:right-100" />
          <Image
            src="/pinguin.png"
            width={800}
            height={800}
            alt="Doscom Mascot"
            className="absolute right-10 bottom-0 z-10 -mb-39.5 object-cover 2xl:right-80"
            priority
          />
        </div>

        {/* Shadow effect */}
        <div className="shadow"></div>
      </div>
    </div>
  );
}
