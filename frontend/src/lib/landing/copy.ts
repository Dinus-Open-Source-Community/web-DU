import { ROUTES } from "@/lib/routes";

export const LANDING_COPY = {
  hero: {
    eyebrow: "Komunitas Open Source Udinus",
    titleA: "Ngoding sendirian",
    titleB: "itu sepi.",
    sub: "Belajar bareng komunitas, dibimbing mentor praktisi, pulang bawa portofolio open source.",
    primaryCta: { label: "Gabung Komunitas", href: ROUTES.register },
    secondaryCta: { label: "Jelajahi Kursus", href: ROUTES.courses },
    scrollTease: "",
  },
  /** Frasa khas DOSCOM di pita berjalan — bukan kata kunci SEO, bukan duplikat copy section. */
  ticker: [
    "PR pertama di-merge",
    "sesi mentoring tiap pekan",
    "sprint dua minggu sekali",
    "dari nol sampai kontribusi",
    "kode di-review, bukan dinilai",
    "yang takut nanya justru rugi",
    "belajar sambil bikin proyek beneran",
  ],
  notes: [
    { title: "Proyek OSS asli", copy: "Kontribusi ke repo komunitas beneran." },
    {
      title: "Mentor praktisi",
      copy: "Belajar dari yang tiap hari di lapangan.",
    },
    {
      title: "Sprint & code review",
      copy: "Kode kamu dibaca, bukan cuma dinilai.",
    },
    { title: "Sertifikat capstone", copy: "Bukti nyata di akhir program." },
    { title: "Komunitas Udinus", copy: "Temukan kru ngodingmu." },
  ],
  stack: {
    eyebrow: "Our Stack",
    title: "Tools we actually use.",
    copy: "The real technologies running this platform — what you learn is what we ship.",
  },
  mentors: {
    eyebrow: "Our Mentors",
    title: "Taught by people on the job.",
    copy: "Practitioners who teach — not just names on a brochure.",
  },
  course: {
    eyebrow: 'Courses',
    title: 'Leave with a portfolio.',
    copy: 'Web (Next.js & Laravel separately), UI/UX, and DevOps — built with the community, ending in real projects you can point to.',
    allHref: ROUTES.courses,
    allLabel: 'See all courses',
  },
  terminal: {
    eyebrow: "Terminal",
    title: "Cobain ngetik dulu.",
    copy: "Klik perintahnya atau ketik sendiri. Tidak ada yang bisa rusak di sini.",
  },
  gallery: {
    eyebrow: "Gallery",
    title: "What learning looks like here.",
    copy: "Documentation of meetups, workshops, and community hangs.",
  },
  testimonial: {
    eyebrow: "Testimonials",
    title: "Once participants, now mentors.",
    copy: "These three started at the same point you are now.",
  },
} as const;
