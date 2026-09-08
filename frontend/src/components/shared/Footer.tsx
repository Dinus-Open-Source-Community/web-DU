import { Link, useLocation } from "react-router-dom";
import { socialLinks } from "../../lib/navigation";

export default function Footer() {
  const { pathname } = useLocation();

  const isFooterHidden =
    pathname?.startsWith("/course/") && pathname !== "/course";

  if (isFooterHidden) {
    return null;
  }

  return (
    <footer className="bg-ink-800 text-paper-white sticky bottom-0 z-0 w-full overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 pt-10 pb-4 max-sm:pt-5 max-sm:pb-2 sm:px-6 sm:pt-16 sm:pb-8 lg:px-8 lg:pt-24 lg:pb-12">
        {/* Brand + sosial */}

        <div className="flex flex-col items-start justify-between gap-5 max-sm:gap-4 md:flex-row md:items-center md:gap-8">
          <div>
            <Link
              to="/"
              className="font-display text-brand-blue focus-visible:ring-brand-blue/60 inline-block rounded-lg text-2xl font-bold tracking-tight transition outline-none hover:-translate-y-0.5 focus-visible:ring-3 lg:text-3xl"
            >
              DOSCOM University
            </Link>
            <p className="text-paper-white/60 mt-3 max-w-md text-sm leading-relaxed max-sm:mt-2">
              Program intensif open source DOSCOM — belajar ngoding bareng
              komunitas, dari nol sampai bisa ikut kontribusi.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              const isPlaceholder = social.href === "#";
              return isPlaceholder ? (
                <span
                  key={social.label}
                  aria-disabled="true"
                  title={`${social.label} — segera hadir`}
                  className="border-paper-white/25 bg-paper-white/10 text-paper-white/40 grid size-10 cursor-not-allowed place-items-center rounded-full border-2 border-dashed lg:size-11"
                >
                  <Icon className="size-5" />
                </span>
              ) : (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="text-ink-900 hover:text-brand-blue shadow-button hover:shadow-button-hover border-ink-900 bg-paper-white focus-visible:ring-paper-white/80 grid size-10 place-items-center rounded-full border-2 transition outline-none hover:-translate-y-1 focus-visible:ring-3 lg:size-11"
                >
                  <Icon className="size-5" />
                </a>
              );
            })}
          </div>
        </div>

        <p className="text-paper-white/60 mt-3 text-center text-xs max-sm:mt-2 sm:mt-8 lg:mt-10">
          &copy; {new Date().getFullYear()} Doscom University
        </p>
      </div>

      <div
        aria-hidden
        className="pointer-events-none relative mt-3 mb-1 flex items-end overflow-hidden select-none max-sm:justify-start max-sm:mb-0.5 md:justify-center lg:mb-2"
      >
        <span className="font-display text-paper-white/20 text-[clamp(2.75rem,14vw,7rem)] leading-[0.8] font-bold tracking-tight whitespace-nowrap max-sm:text-[clamp(3.25rem,23vw,9rem)] md:text-[clamp(4rem,15vw,12rem)] lg:text-[clamp(4.5rem,16vw,14rem)]">
          DOSCOM
        </span>
      </div>
    </footer>
  );
}
