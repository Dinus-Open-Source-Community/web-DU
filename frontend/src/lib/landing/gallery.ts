export type GalleryImage = {
  src: string
  /** Alt ringkas untuk <img> — isi foto, dibaca screen reader sekali. */
  alt: string
  /** Caption cerita yang tampil di kartu (bukan duplikat alt panjang). */
  caption: string
}

/**
 * Foto kegiatan DOSCOM dari public/images (3 file, dipakai bergantian).
 * LAUNCH GATE: ganti/rapikan saat kurasi foto asli tersedia. Caption bervariasi
 * per entri agar tiap kartu scrapbook punya cerita sendiri.
 */
const SRC = {
  a: '/images/_BW08644.JPG',
  b: '/images/_BW08702.JPG',
  c: '/images/_BW08640.JPG',
} as const

export const GALLERY_IMAGES: GalleryImage[] = [
  {
    src: SRC.a,
    alt: 'Peserta kumpul melingkar di sekretariat',
    caption: 'Kumpul perdana — laptop terbuka, obrolan nyambung.',
  },
  {
    src: SRC.b,
    alt: 'Mentor mendampingi peserta memperbaiki kode',
    caption: 'Sesi mentoring: error yang tadi bikin pusing, beres bareng.',
  },
  {
    src: SRC.c,
    alt: 'Peserta menunjuk layar saat demo proyek',
    caption: 'Demo hasil sprint — dari ide jadi barang yang bisa diklik.',
  },
  {
    src: SRC.a,
    alt: 'Suasana ruang sekretariat saat kumpul',
    caption: 'Sticky notes di dinding, tawa di pojok ruangan.',
  },
  {
    src: SRC.b,
    alt: 'Layar laptop dengan kode saat mentoring',
    caption: 'Code review pertama: menegangkan, lalu nagih.',
  },
  {
    src: SRC.c,
    alt: 'Peserta antusias saat presentasi',
    caption: 'PR pertama di-merge — rasanya seperti menang lomba.',
  },
  {
    src: SRC.a,
    alt: 'Peserta belajar bareng di meja panjang',
    caption: 'Belajar bareng: yang bisa, ngajarin yang baru mulai.',
  },
  {
    src: SRC.b,
    alt: 'Mentor menjelaskan di samping peserta',
    caption: 'Pertanyaan "kalau gini gimana?" — selalu ada jawabannya.',
  },
  {
    src: SRC.c,
    alt: 'Demo proyek di depan layar besar',
    caption: 'Sprint dua minggu, hasilnya dipamerin ke semua.',
  },
  {
    src: SRC.a,
    alt: 'Kegiatan komunitas di sekretariat DOSCOM',
    caption: 'Ruang ini tempat banyak cerita dimulai.',
  },
  {
    src: SRC.b,
    alt: 'Peserta fokus di depan laptop',
    caption: 'Mode fokus: headset, kopi, dan satu masalah yang harus takluk.',
  },
  {
    src: SRC.c,
    alt: 'Sorak peserta setelah demo sukses',
    caption: 'Launch! Yang tadinya cuma rencana, sekarang live.',
  },
]
