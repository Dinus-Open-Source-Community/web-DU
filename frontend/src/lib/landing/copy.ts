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
    eyebrow: "Tumpukan Kami",
    title: "Senjata yang kami pakai.",
    copy: "Teknologi nyata yang menjalankan platform ini — yang kamu pelajari, yang kami pakai.",
  },
  mentors: {
    eyebrow: "Para Mentor",
    title: "Dipegang langsung orang lapangan.",
    copy: "Praktisi yang mengajar di kursus, bukan sekadar namanya di brosur.",
  },
  course: {
    eyebrow: "Kursus Unggulan",
    title: "Pulangnya bawa portofolio.",
    copy: "Tiga jalur yang dikembangkan bareng komunitas — mulai dari yang paling dasar.",
    allHref: ROUTES.courses,
    allLabel: "Lihat semua kursus",
  },
  terminal: {
    eyebrow: "Terminal",
    title: "Cobain ngetik dulu.",
    copy: "Klik perintahnya atau ketik sendiri. Tidak ada yang bisa rusak di sini.",
  },
  gallery: {
    eyebrow: "Galeri Kegiatan",
    title: "Suasana belajar kami.",
    copy: "Dokumentasi kegiatan, workshop, dan kumpul komunitas.",
  },
  testimonial: {
    eyebrow: "Kata Mereka",
    title: "Dulu peserta, sekarang ngajar.",
    copy: "Tiga mentor ini dulu mulai dari titik yang sama dengan kamu.",
  },
} as const;
