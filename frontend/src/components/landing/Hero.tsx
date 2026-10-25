import {
  BadgeCheck,
  GitBranch,
  GitPullRequest,
  GraduationCap,
  HeartHandshake,
} from "lucide-react";
import Footprints from "@/components/playful/Footprints";
import Reveal from "@/components/playful/Reveal";
import { LANDING_COPY } from "@/lib/landing/copy";

const NOTE_ICONS = [
  GitBranch,
  GraduationCap,
  GitPullRequest,
  BadgeCheck,
  HeartHandshake,
] as const;

const BENEFIT_STYLES = [
  "bg-note-yellow -rotate-2",
  "bg-note-mint rotate-2",
  "bg-note-peach -rotate-1",
  "bg-note-pink rotate-2",
] as const;

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
            <div className="mt-8 flex max-w-3xl flex-wrap justify-center gap-3 sm:gap-4">
              {notes.slice(0, 4).map((note, index) => {
                const Icon = NOTE_ICONS[index];
                return (
                  <span
                    key={note.title}
                    className={`text-ink-900 inline-flex items-center gap-2 rounded-full border-2 border-ink-900 px-4 py-2 text-xs font-extrabold shadow-button transition-transform duration-200 hover:-translate-y-1 sm:px-5 sm:py-2.5 sm:text-sm ${BENEFIT_STYLES[index]}`}
                  >
                    <Icon aria-hidden className="size-4 sm:size-[18px]" />
                    {note.title}
                  </span>
                );
              })}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
