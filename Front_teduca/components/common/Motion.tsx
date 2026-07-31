'use client'

import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

const easeOutSoft = [0.22, 1, 0.36, 1] as const

/** Entrada fade + slide-up. Ideal para secciones y cards al montar. */
export function FadeIn({
  className,
  delay = 0,
  y = 14,
  children,
  ...props
}: HTMLMotionProps<'div'> & { delay?: number; y?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: easeOutSoft }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/** Contenedor con stagger para listas/grids. */
export function Stagger({
  className,
  children,
  ...props
}: HTMLMotionProps<'div'>) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.07 } },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/** Item para usar dentro de <Stagger>. */
export function StaggerItem({
  className,
  children,
  ...props
}: HTMLMotionProps<'div'>) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOutSoft } },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/** Card con hover-lift suave (spring). */
export function HoverLift({
  className,
  children,
  ...props
}: HTMLMotionProps<'div'>) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className={cn('h-full', className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}
