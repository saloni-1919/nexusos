import { useEffect, useRef, type ReactNode } from 'react'
import { gsap } from '@/lib/gsapSetup'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/utils'

interface RevealProps {
  children: ReactNode
  className?: string
  /** stagger between direct children, seconds */
  stagger?: number
  y?: number
  delay?: number
}

/**
 * Generic scroll-in reveal: direct children fade/slide in with a stagger
 * when the wrapper enters the viewport. Content is visible by default;
 * animation only ever enhances.
 */
export function Reveal({ children, className, stagger = 0.08, y = 28, delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el || reduced) return
    const ctx = gsap.context(() => {
      gsap.from(el.children, {
        y,
        autoAlpha: 0,
        duration: 0.7,
        ease: 'power3.out',
        stagger,
        delay,
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      })
    }, el)
    return () => ctx.revert()
  }, [stagger, y, delay, reduced])

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  )
}
