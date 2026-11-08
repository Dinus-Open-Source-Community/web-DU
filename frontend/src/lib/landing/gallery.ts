export type GalleryImage = {
  src: string
  /** Alt ringkas untuk <img> — isi foto, dibaca screen reader sekali. */
  alt: string
  /** Caption cerita yang tampil di kartu (bukan duplikat alt panjang). */
  caption: string
  /** Override varian kulit kartu (0..5). Jika kosong → dipakai `globalIdx % 6`. */
  variant?: 0 | 1 | 2 | 3 | 4 | 5
}
