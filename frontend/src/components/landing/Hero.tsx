import {
  AnimatePresence,
  motion,
  useAnimation,
  useReducedMotion,
} from "motion/react";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  GitBranch,
  GitPullRequest,
  GraduationCap,
  HeartHandshake,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Footprints from "@/components/playful/Footprints";
import HandUnderline from "@/components/playful/HandUnderline";
import PenguinMascot from "@/components/playful/PenguinMascot";
import Reveal from "@/components/playful/Reveal";
import { LANDING_COPY } from "@/lib/landing/copy";

const EGG_CLICKS = 5;

const NOTE_BG = [
  "bg-note-yellow",
  "bg-note-mint",
  "bg-note-peach",
  "bg-note-pink",
  "bg-note-sky",
  "bg-note-lavender",
] as const;

type HeroNoteProps = {
  title: string;
  icon: React.ReactNode;
  index: number;
  className?: string;
};

const NOTE_ICONS = [
  GitBranch,
  GraduationCap,
  GitPullRequest,
  BadgeCheck,
  HeartHandshake,
] as const;

/** Sticky note — sekarang statis (diam). Tanpa drag/hover/bob/parallax. */
function HeroNote({ title, icon, index, className }: HeroNoteProps) {
  const slot = index % NOTE_BG.length;
  return (
    <div
      className={cn(
        "shadow-paper relative px-5 pt-6 pb-4 select-none",
        NOTE_BG[slot],
        className,
      )}
    >
      <span
        aria-hidden
        className="absolute -top-2.5 left-1/2 h-[18px] w-[62px] -translate-x-1/2 -rotate-3 bg-[rgba(111,119,128,0.28)]"
      />
      <div className="text-ink-900 flex items-center gap-2">
        <span className="shrink-0 [&_svg]:size-6">{icon}</span>
        <p className="text-lg leading-snug font-extrabold">{title}</p>
      </div>
    </div>
  );
}

type NoteOrbit = {
  noteIndex: number;
  wrapClass: string;
  tiltClass: string;
};

const NOTE_ORBITS: NoteOrbit[] = [
  { noteIndex: 0, wrapClass: "top-[16%] left-[4%]", tiltClass: "-rotate-3" },
  { noteIndex: 1, wrapClass: "top-[24%] right-[5%]", tiltClass: "rotate-2" },
  { noteIndex: 2, wrapClass: "bottom-[30%] left-[6%]", tiltClass: "-rotate-2" },
  { noteIndex: 3, wrapClass: "right-[6%] bottom-[24%]", tiltClass: "rotate-3" },
];

export default function Hero() {
  const { hero, notes } = LANDING_COPY;
  const reduceMotion = useReducedMotion();
  const [boops, setBoops] = useState(0);
  const [eggOn, setEggOn] = useState(false);
  const eggControls = useAnimation();

  const boop = (): void => {
    const next = boops + 1;
    if (next >= EGG_CLICKS) {
      setBoops(0);
      setEggOn(true);
      // Tetap bisa diklik saat reduced-motion — spin dilewati, bubble muncul.
      if (!reduceMotion) {
        void eggControls.start({
          rotate: [0, 360],
          transition: { duration: 0.6 },
        });
      }
      window.setTimeout(() => setEggOn(false), 2500);
    } else {
      setBoops(next);
    }
  };

  return (
    <section
      id="top"
      className="bg-paper-white relative overflow-hidden pt-32 pb-24 sm:pt-32 lg:pt-40 lg:pb-36"
    >
      {/* Latar: grid kertas grafik halus */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #050914 1px, transparent 1px), linear-gradient(to bottom, #050914 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Konten center editorial (referensi CANVAS): wordmark, sub, CTA.
          Dibungkus Reveal (in/out viewport) agar saat scroll balik ke hero,
          konten "masuk" lagi — konsisten dgn section lain. */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        <Reveal>
          <h1
            className="font-display text-ink-900 text-[clamp(2.75rem,9.5vw,8.5rem)] leading-[0.88] font-bold [text-wrap:balance]"
          >
            {hero.titleA}{" "}
            <span className="relative inline-block whitespace-nowrap">
              {hero.titleB}
              <HandUnderline draw className="absolute -bottom-3 left-0" />
            </span>
          </h1>
        </Reveal>

        <Reveal delay={0.08}>
          <div data-hero-sub className="mx-auto mt-6 max-w-2xl sm:mt-8">
            <p className="text-ink-600 text-base leading-relaxed sm:text-lg lg:text-xl">
              {hero.sub}
            </p>
            <Footprints className="mt-4 justify-center opacity-60 [&_svg]:w-4" />
          </div>
        </Reveal>

        <Reveal delay={0.16}>
          <div
            data-hero-cta
            className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Button
              asChild
              size="lg"
              className="group/button h-14 px-8 text-base"
            >
              <Link to={hero.primaryCta.href}>
                {hero.primaryCta.label}
                <ArrowRight className="size-5 transition-transform duration-300 group-hover/button:translate-x-1" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-14 px-8 text-base"
            >
              <Link to={hero.secondaryCta.href}>{hero.secondaryCta.label}</Link>
            </Button>
          </div>
        </Reveal>
      </div>

      {/* Gugusan notes — statis (diam) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 hidden lg:block"
      >
        {NOTE_ORBITS.map((orbit) => {
          const note = notes[orbit.noteIndex];
          return (
            <div
              key={orbit.noteIndex}
              className={cn("absolute", orbit.wrapClass)}
            >
              <HeroNote
                title={note.title}
                icon={(() => {
                  const Icon = NOTE_ICONS[orbit.noteIndex % NOTE_ICONS.length];
                  return <Icon />;
                })()}
                index={orbit.noteIndex}
                className={orbit.tiltClass}
              />
            </div>
          );
        })}
      </div>

      {/* Pinguin — mengintip kanan-bawah (desktop lg+). Tablet memakai blok
          mengalir di bawah (lihat blok ajakan) supaya tidak menutupi CTA. */}
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 z-10",
          "hidden justify-end pr-[5%] lg:flex",
        )}
      >
        <div className="pointer-events-auto relative">
          <button
            type="button"
            onClick={boop}
            aria-label="Sapa pinguin"
            className="block cursor-pointer bg-transparent"
          >
            <motion.div
              animate={eggControls}
              whileHover={
                !reduceMotion ? { rotate: -3, scale: 1.04 } : undefined
              }
              whileTap={!reduceMotion ? { scale: 0.94 } : undefined}
            >
              <PenguinMascot className="w-32 -rotate-2 lg:w-40" />
            </motion.div>
          </button>
          <AnimatePresence>
            {eggOn && (
              <motion.p
                role="status"
                initial={{ opacity: 0, y: 8, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                className="border-ink-900 bg-note-yellow text-ink-900 shadow-paper absolute -top-12 left-1/2 -translate-x-1/2 -rotate-3 rounded-xl border-2 px-3 py-1 text-sm font-extrabold whitespace-nowrap"
              >
                wark!
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Ajakan pinguin — mobile & tablet (lg+ memakai pinguin absolute kanan).
          Mengalir di bawah konten → tidak pernah menutupi CTA. */}
      <div className="relative z-10 mx-auto mt-10 max-w-md px-6 text-center sm:mt-12 lg:hidden">
        <div className="relative inline-block">
          <button
            type="button"
            onClick={boop}
            aria-label="Sapa pinguin"
            className="group relative mx-auto block cursor-pointer bg-transparent outline-none"
          >
            <motion.div
              animate={eggControls}
              whileTap={!reduceMotion ? { scale: 0.9, rotate: -2 } : undefined}
              whileHover={!reduceMotion ? { scale: 1.05 } : undefined}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
            >
              <PenguinMascot className="w-24 -rotate-3 sm:w-28 md:w-36" />
            </motion.div>
          </button>
          <AnimatePresence>
            {eggOn && (
              <motion.p
                role="status"
                initial={{ opacity: 0, y: 8, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                className="border-ink-900 bg-note-yellow text-ink-900 shadow-paper absolute -top-12 left-1/2 -translate-x-1/2 -rotate-3 rounded-xl border-2 px-3 py-1 text-sm font-extrabold whitespace-nowrap"
              >
                wark!
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        <p className="text-ink-500 mt-2 text-[11px] font-bold tracking-wider uppercase md:text-xs">
          Coba ketuk pinguin 5x
        </p>
      </div>
    </section>
  );
}
