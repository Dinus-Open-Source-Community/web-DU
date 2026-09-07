export type GalleryImage = {
  src: string
  /** Alt ringkas untuk <img> — isi foto, dibaca screen reader sekali. */
  alt: string
  /** Caption cerita yang tampil di kartu (bukan duplikat alt panjang). */
  caption: string
  /** Override varian kulit kartu (0..5). Jika kosong → dipakai `globalIdx % 6`. */
  variant?: 0 | 1 | 2 | 3 | 4 | 5
}

/**
 * Galeri DOSCOM — 9 foto kegiatan terbaru.
 * Semua foto dari public/images yang sebelumnya uncommitted kini masuk galeri
 * (jariz & alfi dihapus sesuai permintaan — sisa 9). awward.webp di posisi
 * terakhir sebagai penutup.
 * Alt ringkas, caption bercerita dengan nada komunitas — bukan AI slop.
 */
export const GALLERY_IMAGES: GalleryImage[] = [
  {
    src: '/images/panit1.webp',
    alt: 'Panitia DOSCOM berfoto bersama di depan backdrop kegiatan',
    caption: 'Tim di balik layar — yang bikin acara jalan tanpa drama.',
    variant: 3,
  },
  {
    src: '/images/crevmed1.webp',
    alt: 'Peserta kelas UI/UX merancang wireframe di Figma',
    caption: 'Kelas UI/UX: dari coretan kertas sampai wireframe yang klikable.',
  },
  {
    src: '/images/crevmed2.webp',
    alt: 'Diskusi desain antarmuka di depan layar Figma',
    caption: 'Revisi desain ke-7 — yang penting user nggak bingung.',
  },
  {
    src: '/images/crevmed3.webp',
    alt: 'Peserta mempresentasikan prototipe UI di depan kelas',
    caption: 'Prototipe dipresentasikan, feedback langsung — bukan tebak-tebakan.',
  },
  {
    src: '/images/web.JPG',
    alt: 'Peserta kelas web development di depan layar kode',
    caption: 'Kelas web: dari HTML sampai deploy — bareng-bareng.',
  },
  {
    src: '/images/random.webp',
    alt: 'Momen candid peserta tertawa bersama di sela kegiatan',
    caption: 'Random tapi ngena — tawa paling jujur setelah sprint.',
  },
  {
    src: '/images/random2.webp',
    alt: 'Suasana santai peserta setelah sesi kelas',
    caption: 'Selesai sprint, waktunya ngobrol santai dan tukeran cerita.',
  },
  {
    src: '/images/closed.webp',
    alt: 'Foto bersama penutupan kegiatan DOSCOM',
    caption: 'Penutupan bukan perpisahan — sampai jumpa di sprint berikutnya.',
  },
  {
    src: '/images/awward.webp',
    alt: 'Momen penerimaan penghargaan peserta terbaik DOSCOM di atas panggung',
    caption: 'Peserta terbaik — yang paling konsisten dari sprint pertama sampai akhir, akhirnya dipanggil ke panggung penghargaan.',
  },
]
