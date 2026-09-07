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
    title: "Stack yang beneran kami pakai.",
    copy: "Teknologi yang jalan di platform ini — yang kamu pelajari, ya ini juga yang kami pakai.",
  },
  mentors: {
    eyebrow: "Our Mentors",
    title: "Belajar dari yang tiap hari berkutat di kode.",
    copy: "Mereka yang ngajar adalah praktisi — bukan sekadar nama yang nangkring di brosur.",
  },
  course: {
    eyebrow: "Courses",
    title: "Empat kelas. Satu tujuan: portofolio.",
    copy: "Web (Next.js & Laravel terpisah), UI/UX, dan DevOps — bareng komunitas, ujungnya proyek nyata yang bisa kamu tunjuk.",
    allHref: ROUTES.courses,
    allLabel: "Lihat semua kelas",
  },
  terminal: {
    eyebrow: "Terminal",
    title: "Cobain ngetik dulu.",
    copy: "Klik perintahnya atau ketik sendiri — dijamin nggak bakal merusak apa-apa.",
  },
  gallery: {
    eyebrow: 'Galeri Kegiatan',
    title: 'Suasana belajar yang hidup.',
    copy: 'Dari kelas UI/UX sampai sprint web & DevOps — kumpul, ngoding, dan dokumentasi bareng.',
  },
  testimonial: {
    eyebrow: "Reviews",
    title: "Kata mereka yang udah jalan duluan.",
    copy: "Cerita asli peserta, bukan brosur — dari yang mulai nol sampai akhirnya bisa bikin sendiri.",
  },
} as const;
