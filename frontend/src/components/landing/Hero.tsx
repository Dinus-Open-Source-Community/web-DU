import {
  BadgeCheck,
  GitBranch,
  GitPullRequest,
  GraduationCap,
  HeartHandshake,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Footprints from "@/components/playful/Footprints";
import Reveal from "@/components/playful/Reveal";
import { LANDING_COPY } from "@/lib/landing/copy";

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

  return (
    <section
      id="top"
      className="relative flex h-svh flex-col overflow-hidden bg-paper-offwhite pt-16"
    >
      {/* Latar: grid kertas grafik halus */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-100"
        style={{
          backgroundImage:
            'linear-gradient(to right, color-mix(in srgb, var(--color-ink-900) 6%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--color-ink-900) 6%, transparent) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Satu layar: area di bawah navbar (pt-16) + konten di tengah vertikal/horizontal */}
      <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col items-center justify-center px-6 text-center">
        <Reveal>
          <h1
            className="font-display text-ink-900 text-[clamp(2.75rem,9.5vw,8.5rem)] leading-[0.88] font-bold [text-wrap:balance]"
          >
            {hero.titleA}{" "}
            <span className="relative inline-block whitespace-nowrap">
              {hero.titleB}
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
    </section>
  );
}
