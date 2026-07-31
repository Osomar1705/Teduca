'use client'

import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

const easeOutSoft = [0.22, 1, 0.36, 1] as const
const viewportOnce = { once: true, margin: '0px 0px -80px 0px' } as const

/** Entrada fade + slide-up al montar. Ideal para héroes above-the-fold. */
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
      transition={{ duration: 0.5, delay, ease: easeOutSoft }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/** Reveal elegante al entrar en viewport (una sola vez). */
export function Reveal({
  className,
  delay = 0,
  y = 20,
  children,
  ...props
}: HTMLMotionProps<'div'> & { delay?: number; y?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewportOnce}
      transition={{ duration: 0.6, delay, ease: easeOutSoft }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/** Contenedor con stagger que revela sus hijos al scrollear. */
export function Stagger({
  className,
  children,
  ...props
}: HTMLMotionProps<'div'>) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
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
        hidden: { opacity: 0, y: 18 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: easeOutSoft },
        },
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
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn('h-full', className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}
