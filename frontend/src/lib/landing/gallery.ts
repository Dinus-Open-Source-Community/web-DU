export type GalleryImage = { src: string; alt: string }

/**
 * Foto kegiatan DOSCOM. File mentah dari public/images — sengaja dipakai apa
 * adanya (16:9, tanpa crop) karena yang penting momennya, bukan pikselnya.
 * TODO: ganti dengan hasil kurasi/foto baru bila sudah ada.
 */
export const GALLERY_IMAGES: GalleryImage[] = [
  {
    src: '/images/_BW08644.JPG',
    alt: 'Suasana kumpul DOSCOM: peserta duduk melingkar di ruang sekretariat sambil membuka laptop, sebagian mencatat di buku.',
  },
  {
    src: '/images/_BW08702.JPG',
    alt: 'Sesi mentoring: mentor duduk di samping peserta yang sedang memperbaiki kode, layar laptop menyala di meja panjang.',
  },
  {
    src: '/images/_BW08640.JPG',
    alt: 'Peserta antusias menunjuk layar presentasi saat demo proyek hasil sprint komunitas.',
  },
]
