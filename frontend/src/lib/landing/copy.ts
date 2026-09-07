import { ROUTES } from "@/lib/routes";

export const LANDING_COPY = {
  hero: {
    eyebrow: "Komunitas Open Source Udinus",
    titleA: "Ngoding sendirian",
    titleB: "itu sepi.",
    sub: "Belajar bareng komunitas, dibimbing mentor praktisi, pulang bawa portofolio open source.",
    primaryCta: { label: "Gabung Komunitas", href: ROUTES.register },
    secondaryCta: { label: "Jelajahi Kursus", href: ROUTES.courses },
    scrollTease: "di bawah ada terminal, kelas, dan galeri — scroll pelan",
  },
  /** Frasa khas DOSCOM di pita berjalan — bukan kata kunci SEO, bukan duplikat copy section. */
  ticker: [
    "first PR merged",
    "mentoring every week",
    "sprints every two weeks",
    "from zero to contributor",
    "code gets reviewed, not judged",
    "ask early, ask often",
    "learn by building real things",
  ],
  notes: [
    { title: "Real OSS Projects", copy: "Contribute to real community repos." },
    {
      title: "Mentor Practitioners",
      copy: "Learn from people who ship every day.",
    },
    {
      title: "Sprints & Code Review",
      copy: "Your code gets read, not just graded.",
    },
    {
      title: "Capstone Certificate",
      copy: "Tangible proof at the end of the program.",
    },
  ],
  stack: {
    eyebrow: "Our Stack",
    title: "The stack we actually use.",
    copy: "The real technologies running this platform — what you learn is what we ship.",
  },
  mentors: {
    eyebrow: "Our Mentors",
    title: "Learn from people who live in the code.",
    copy: "Your mentors are working practitioners — not just names on a brochure.",
  },
  course: {
    eyebrow: "Courses",
    title: "Four tracks. One goal: a portfolio.",
    copy: "Web (Next.js & Laravel separately), UI/UX, and DevOps — built with the community, ending in real projects you can point to.",
    allHref: ROUTES.courses,
    allLabel: "See all classes",
  },
  terminal: {
    eyebrow: "Terminal",
    title: "Try typing around.",
    copy: "Click a command or type your own — nothing here can break.",
  },
  gallery: {
    eyebrow: "Gallery",
    title: "What learning actually looks like.",
    copy: "From UI/UX classes to web & DevOps sprints — hanging out, coding, and documenting it all.",
  },
  testimonial: {
    eyebrow: "Reviews",
    title: "Word from those who started before you.",
    copy: "Real stories from participants, not a brochure — from starting at zero to building on your own.",
  },
} as const;
