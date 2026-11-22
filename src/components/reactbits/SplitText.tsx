import { createElement, useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsapSetup'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface SplitTextProps {
  text: string
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div'
  /** seconds before the reveal starts once in view */
  delay?: number
  /** per-character stagger in seconds */
  stagger?: number
}

/**
 * React Bits-style split-text reveal: each character slides up out of an
 * overflow mask as the element scrolls into view. Content is fully readable
 * in the DOM for screen readers and never hidden without JS/GSAP.
 */
export function SplitText({ text, className, as = 'span', delay = 0, stagger = 0.018 }: SplitTextProps) {
  const ref = useRef<HTMLElement | null>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el || reduced) return
    const ctx = gsap.context(() => {
      gsap.from(el.querySelectorAll('.st-char'), {
        yPercent: 115,
        duration: 0.75,
        ease: 'power3.out',
        stagger,
        delay,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      })
    }, el)
    return () => ctx.revert()
  }, [text, delay, stagger, reduced])

  const words = text.split(' ')
  return createElement(
    as,
    { ref, className, 'aria-label': text },
    words.map((word, wi) => (
      <span key={wi} aria-hidden="true" className="inline-block overflow-hidden align-bottom pb-[0.1em] -mb-[0.1em]">
        <span className="inline-block whitespace-nowrap">
          {word.split('').map((char, ci) => (
            <span key={ci} className="st-char inline-block will-change-transform">
              {char}
            </span>
          ))}
        </span>
        {wi < words.length - 1 ? <span className="inline-block"> </span> : null}
      </span>
    )),
  )
}
