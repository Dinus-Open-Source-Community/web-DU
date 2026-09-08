import { motion, useInView, useReducedMotion } from 'motion/react'
import { useRef, type ReactNode } from 'react'

type RevealProps = {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
}

/**
 * Reveal — animasi masuk/keluar berbasis viewport (bukan one-shot).
 * Saat elemen memasuki viewport → animasi ke visible; saat meninggalkan
 * viewport (atas/bawah) → kembali ke hidden, sehingga "datang" selalu memutar
 * animasi masuk lagi. Margin -48px vertikal: animasi mulai saat elemen sudah
 * 48px di dalam viewport (bukan baru menyentuh tepi) dan keluar saat nyaris
 * lewat — elemen tinggi tidak berkedip di tengah viewport.
 * Reduced-motion: konten statis (tanpa animasi).
 */
export default function Reveal({ children, className, delay = 0, y = 36 }: RevealProps) {
  const reduceMotion = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: false, margin: '-48px 0px -48px 0px' })

  if (reduceMotion) return <div className={className}>{children}</div>

  return (
    <motion.div
      ref={ref}
      className={className}
      // initial=false: elemen di luar viewport langsung hidden tanpa animasi
      // mount; elemen yang sudah terlihat saat load tampil tanpa kedip.
      initial={false}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{
        // Masuk: 0.7s ease khas; keluar: lebih cepat agar scroll cepat tidak
        // menumpuk kedip. Delay hanya berlaku saat masuk.
        duration: inView ? 0.7 : 0.4,
        delay: inView ? delay : 0,
        ease: inView ? [0.22, 1, 0.36, 1] : [0.4, 0, 1, 1],
      }}
    >
      {children}
    </motion.div>
  )
}
