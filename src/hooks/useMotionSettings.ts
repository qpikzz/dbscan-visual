import { useReducedMotion } from 'motion/react'

const easing = [0.22, 1, 0.36, 1] as const

export function useMotionSettings() {
  const reduced = useReducedMotion() ?? false

  const fadeSlide = (offset: number) => ({
    initial: { opacity: 0, ...(reduced ? {} : { y: offset }) },
    animate: { opacity: 1, ...(reduced ? {} : { y: 0 }) },
    exit: { opacity: 0, ...(reduced ? {} : { y: offset }) },
  })

  const transition = (duration: number, delay = 0) => ({
    duration: reduced ? 0.1 : duration,
    ease: easing,
    delay,
  })

  return { reduced, fadeSlide, transition }
}