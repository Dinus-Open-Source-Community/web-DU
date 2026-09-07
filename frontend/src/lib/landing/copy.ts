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
  /**
   * Playground — arcade "sampai PR di-merge": babak pilih jalur → jalan →
   * merge day → kartu hasil. Semua teks state/babak di bawah dipakai section;
   * jangan hardcode berceceran di komponen.
   */
  playground: {
    eyebrow: "Playground",
    title: "Coba rasanya PR di-merge.",
    copy: "Pilih jalur, jalan sampai ujung, terus buka PR pertamamu. Semua pura-pura — rasa menangnya beneran.",
    /** Label HUD babak, urut sesuai alur main. */
    acts: ["Pilih jalur", "Jalan", "Merge day", "Merged"],
    pick: {
      kicker: "Klik jalur yang paling mirip kamu.",
      note: "Ujung semua jalur sama: PR pertama yang di-merge.",
      stepsLabel: "pemberhentian",
    },
    travel: {
      change: "Ganti jalur",
      skip: "Langsung ke PR",
      posTitle: "Posisi di peta",
      doneTitle: "Sampai di ujung.",
      doneCopy:
        "Empat pemberhentian, satu tujuan. PR pertamamu sudah nunggu di babak berikutnya.",
      continue: "Lanjut ke Merge Day",
      startLabel: "start",
      finishLabel: "merge day",
    },
    mergeDay: {
      boardLabel: "doscom-university/komunitas",
      prMeta: "fix/typo-readme → main",
      prState: "open",
      issueMeta: "issue #47 · good first issue",
      issueTitle: "typo di README",
      issueDesc:
        "Ada kata recieve yang harusnya receive. Satu baris, sekali ganti, langsung kena.",
      take: "Ambil issue",
      takenNote: "issue #47 diambil — sekarang punyamu.",
      branchHeader: "branch & commit",
      branchName: "fix/typo-readme",
      branchActive: "sedang dikerjakan",
      commitLines: [
        "git checkout -b fix/typo-readme",
        "README.md — recieve → receive",
        'git commit -m "fix: typo di README"',
        "git push -u origin fix/typo-readme",
      ],
      openPr: "Buka pull request",
      reviewBy: "mentor penguin",
      lgtm: "wark! LGTM",
      reviewNote: "Satu typo beres, satu PR masuk. Gas merge.",
      merge: "Merge PR",
      mergedStamp: "MERGED",
      mergedNo: "#001",
    },
    done: {
      kicker: "PR masuk",
      title: "PR pertamamu di-merge.",
      copy: "Rasanya gimana? Di DOSCOM alur ini bukan simulasi — dari issue kecil sampai kode kamu beneran kepake di repo komunitas.",
      notes: ["+1 PR di-merge", "−1 rasa takut buka PR", "0 bug baru"],
      cta: "Mulai jalur ini",
      again: "Main lagi",
      href: ROUTES.courses,
    },
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
  finalCta: {
    title: "Siap berhenti ngoding sendirian?",
    copy: "Gabung komunitas, ikuti sprint pertamamu, dan mulai bangun portofolio open source minggu ini juga.",
    primaryCta: { label: "Gabung Sekarang", href: ROUTES.register },
    secondaryCta: { label: "Lihat Kursus", href: ROUTES.courses },
  },
} as const;
