'use client'

import { motion } from 'framer-motion'

/**
 * Transición de página del área autenticada: se re-monta en cada navegación,
 * dando un fade + slide sutil entre secciones.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
