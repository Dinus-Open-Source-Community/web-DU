import { ICardData, IProgramFeatures } from "./types";
import {
  BookIcons,
  CertificateIcons,
  GlobeLearningIcon,
  JobIcons,
} from "@/components/ui/icons";

export const DataCourse: ICardData[] = [
  {
    variantBadge: "event",
    title: "Advanced React Patterns & Next.js 15 Architecture",
    description:
      "Berhenti menulis kode reaktif yang berantakan. Pelajari cara membangun aplikasi skala enterprise dengan teknik rendering hybrid, manajemen state terdesentralisasi, dan optimasi performa ekstrem.",
    author: {
      name: "Sarah Drasner",
      avatar: "https://i.pravatar.cc/150?u=sarah_d",
    },
    rating: 4.9,
    totalReviews: 1450000,
    image: "https://picsum.photos/seed/react/600/400",
  },
  {
    variantBadge: "free",
    title: "Figma to Code",
    description: "Tutorial singkat.",
    author: {
      name: "Budi",
      avatar: "https://i.pravatar.cc/150?u=budi_dev",
    },
    rating: 0,
    totalReviews: 0,
  },
  {
    variantBadge: "premium",
    title: "Machine Learning with Python: Zero to Hero",
    description:
      "Kuasai algoritma prediksi, manipulasi data dengan Pandas, dan bangun model AI pertama Anda dalam 30 hari. Tidak perlu latar belakang matematika.",
    author: {
      name: "Dr. Alex Chen",
      avatar: "https://i.pravatar.cc/150?u=alex_c",
    },
    rating: 4.6,
    totalReviews: 8432,
    image: "https://picsum.photos/seed/ml/600/400",
  },
  {
    variantBadge: "event",
    title: "UI/UX Fundamentals",
    description:
      "Memahami hierarki visual, tipografi, dan spasi yang rasional. Berhenti menebak-nebak dan gunakan sistem.",
    author: {
      name: "Jessica Wong",
      avatar: "https://i.pravatar.cc/150?u=jess_w",
    },
    rating: 3.2,
    totalReviews: 14,
  },
  {
    variantBadge: "free",
    title: "Mastering Tailwind CSS v4 & Framer Motion",
    description:
      "Eksplorasi animasi kompleks dan layout responsif tingkat lanjut menggunakan utility-first framework.",
    author: {
      name: "Marcus Levin",
      avatar: "https://i.pravatar.cc/150?u=marcus_l",
    },
    rating: 5.0,
    totalReviews: 999,
    image: "https://picsum.photos/seed/tailwind/600/400",
  },
  {
    variantBadge: "premium",
    title: "Rust for WebAssembly",
    description:
      "Tingkatkan performa aplikasi web Anda hingga 10x lipat dengan mengkompilasi Rust ke Wasm. Modul tingkat lanjut untuk engineer senior.",
    author: {
      name: "Elena Rostova",
      avatar: "https://i.pravatar.cc/150?u=elena_r",
    },
    rating: 4.8,
    totalReviews: 21500,
    image: "https://picsum.photos/seed/rust/600/400",
  },
];

export const ProgramFeatures: IProgramFeatures[] = [
  {
    title: "Materi Open Source & Gratis",
    description:
      "Belajar tanpa hambatan biaya dengan kurikulum yang dikembangkan secara terbuka oleh komunitas.",
    icon: <BookIcons />,
  },
  {
    title: "Project-Based Learning",
    description:
      "Kamu tidak hanya menonton video, tapi langsung membangun portofolio nyata untuk melamar kerja.",
    icon: <GlobeLearningIcon />,
  },
  {
    title: "Kurikulum standar industri",
    description:
      "Materi yang disusun berdasarkan kebutuhan dunia kerja nyata, bukan sekadar teori teks buku.",
    icon: <JobIcons />,
  },
  {
    title: "Sertifikat Eksklusif",
    description:
      "Dapatkan bukti kompetensi yang diakui untuk meningkatkan nilai jual kamu di pasar kerja.",
    icon: <CertificateIcons />,
  },
];
