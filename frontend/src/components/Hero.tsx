import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Hero() {
    return (
        <div className="w-full bg-primary/90 py-20 md:py-32">
            <div className="mx-auto max-w-400 px-32 grid lg:grid-cols-2 place-items-center gap-10">
                <div className="text-center lg:text-start space-y-6">
                    <main className="text-4xl md:text-5xl w-124 font-bold">
                        <p className="inline text-popover">
                            Kuasai Teknologi Masa Depan Bersama Komunitas.
                        </p>
                    </main>

                    <p className="text-xl text-popover/95 md:w-10/12 mx-auto lg:mx-0">
                        Pelajari skill IT paling dicari mulai dari Web Development hingga Machine Learning langsung dari mentor berpengalaman di Doscom.
                    </p>

                    <div className="space-y-4 md:space-y-0 md:space-x-4">
                        <Button className="w-full md:w-1/3 bg-popover text-primary" variant="secondary">Pelajari Sekarang</Button>
                    </div>
                </div>

                {/* Hero cards sections */}
                <div className="z-10">
                    <Image
                        src="/pinguin.png"
                        width={500}
                        height={500}
                        alt="Doscom Mascot"
                        className="w-75 h-75 sm:w-100 sm:h-100 md:w-125 md:h-125 object-contain"
                        priority
                    />
                </div>

                {/* Shadow effect */}
                <div className="shadow"></div>
            </div>
        </div>
    );
}
