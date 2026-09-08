import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'

type RevealProps = {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
}

/**
 * Reveal — animasi masuk satu kali saat elemen pertama kali memasuki viewport
 * (bukan in/out berulang). Margin -48px vertikal: animasi mulai saat elemen
 * sudah sedikit masuk viewport. Reduced-motion: konten statis.
 */
export default function Reveal({ children, className, delay = 0, y = 36 }: RevealProps) {
  const reduceMotion = useReducedMotion()
  if (reduceMotion) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
