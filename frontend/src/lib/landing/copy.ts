import { ROUTES } from "@/lib/routes";

export const LANDING_COPY = {
  hero: {
    eyebrow: "Komunitas Open Source Udinus",
    titleA: "Ngoding sendirian",
    titleB: "itu sepi.",
    sub: "Belajar bareng komunitas, dibimbing mentor praktisi, pulang bawa portofolio open source.",
    scrollTease: "di bawah ada terminal, kelas, dan galeri — scroll pelan",
  },
  /** Frasa khas DOSCOM di pita berjalan — bukan kata kunci SEO, bukan duplikat copy section. */
  ticker: [
    "PR pertama tembus",
    "mentoring tiap minggu",
    "sprint tiap dua minggu",
    "dari nol sampai kontributor",
    "kode direview, bukan dihakimi",
    "bertanya itu wajib",
    "belajar sambil membangun",
  ],
  notes: [
    { title: "Proyek OSS Asli", copy: "Kontribusi ke repo komunitas yang nyata." },
    {
      title: "Mentor Praktisi",
      copy: "Belajar dari mereka yang tiap hari merilis karya.",
    },
    {
      title: "Sprint & Code Review",
      copy: "Kodem dibaca dan direview, bukan sekadar dinilai.",
    },
    {
      title: "Sertifikat Capstone",
      copy: "Bukti nyata di akhir program.",
    },
  ],
  stack: {
    eyebrow: "Teknologi Kami",
    title: "Stack yang benar-benar kami pakai.",
    copy: "Teknologi asli yang menjalankan platform ini — yang kamu pelajari adalah yang kami pakai.",
  },
  mentors: {
    eyebrow: "Mentor Kami",
    title: "Belajar dari mereka yang hidup di dalam kode.",
    copy: "Mentormu praktisi yang masih aktif berkarya — bukan sekadar nama di brosur.",
    allHref: ROUTES.mentors,
    allLabel: "Lihat Semua Mentor",
  },
  course: {
    eyebrow: "Kelas",
    title: "Empat jalur. Satu tujuan: portofolio.",
    copy: "Web (Next.js & Laravel terpisah), UI/UX, dan DevOps — dibangun bareng komunitas, berakhir di proyek nyata yang bisa kamu tunjukkan.",
    allHref: ROUTES.courses,
    allLabel: "Lihat Semua Kelas",
  },
  gallery: {
    eyebrow: "Galeri",
    title: "Seperti inilah belajar yang sebenarnya.",
    copy: "Dari kelas UI/UX sampai sprint web & DevOps — nongkrong, ngoding, dan mendokumentasikan semuanya.",
    allHref: ROUTES.gallery,
    allLabel: "Lihat Semua Galeri",
  },
  testimonial: {
    eyebrow: "Ulasan",
    title: "Cerita dari mereka yang mulai lebih dulu.",
    copy: "Cerita nyata para peserta, bukan brosur — dari mulai nol sampai bisa membangun sendiri.",
  },
} as const;
