import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { useMotionSettings } from '../hooks/useMotionSettings'

type RevealProps = {
  children: ReactNode
  className?: string
  delay?: number
}

export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const { fadeSlide, transition } = useMotionSettings()
  const reveal = fadeSlide(24)

  return (
    <motion.div
      className={className}
      initial={reveal.initial}
      whileInView={reveal.animate}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        ...transition(0.6, delay),
      }}
    >
      {children}
    </motion.div>
  )
}