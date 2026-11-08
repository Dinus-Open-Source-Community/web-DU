import { ROUTES } from "@/lib/routes";

export const LANDING_COPY = {
  hero: {
    eyebrow: "Komunitas Belajar & Karya Kreatif Udinus",
    titleA: "Berkarya sendirian",
    titleB: "itu sepi.",
    sub: "Belajar terarah dari dasar sampai mahir, dibimbing mentor praktisi, dan bangun portofolio karya nyata bersama komunitas yang suportif.",
    scrollTease: "di bawah ada program belajar, mentor, dan galeri — scroll pelan",
  },
  /** Frasa berjalan netral & universal untuk platform belajar & komunitas. */
  ticker: [
    "belajar dari nol sampai mahir",
    "mentoring intensif tiap minggu",
    "praktik langsung lewat studi kasus",
    "karya direview, bukan dihakimi",
    "kolaborasi bareng komunitas",
    "belajar sambil membangun karya",
    "portofolio nyata di akhir program",
  ],
  notes: [
    {
      title: "Kurikulum Terstruktur",
      copy: "Materi disusun bertahap dari pemahaman dasar hingga mahir.",
    },
    {
      title: "Bimbingan Praktisi",
      copy: "Belajar langsung dari mereka yang aktif berkarya di industri.",
    },
    {
      title: "Praktik & Proyek Nyata",
      copy: "Bukan sekadar teori, setiap materi diuji lewat karya aplikatif.",
    },
    {
      title: "Sertifikat Terverifikasi",
      copy: "Bukti pencapaian resmi untuk memperkuat portofoliomu.",
    },
  ],
  mentors: {
    eyebrow: "Mentor Kami",
    title: "Belajar langsung dari praktisi yang aktif berkarya.",
    copy: "Mentormu praktisi berpengalaman yang siap membimbing langkah belajarmu — bukan sekadar nama di brosur.",
    allHref: ROUTES.mentors,
    allLabel: "Lihat Semua Mentor",
  },
  course: {
    eyebrow: "Program Belajar",
    title: "Jalur terstruktur untuk setiap tahap belajarmu.",
    copy: "Dari pemahaman fundamental sampai penyelesaian karya mandiri — semua program dirancang berbasis praktik nyata dan didukung bimbingan mentor praktisi.",
    allHref: ROUTES.courses,
    allLabel: "Lihat Semua Program",
  },
  gallery: {
    eyebrow: "Galeri",
    title: "Seperti inilah belajar yang sebenarnya.",
    copy: "Dari diskusi materi di kelas sampai sesi eksplorasi santai bareng teman seangkatan — nongkrong, berdiskusi, berkarya, dan mendokumentasikan semuanya.",
    allHref: ROUTES.gallery,
    allLabel: "Lihat Semua Galeri",
  },
} as const;
