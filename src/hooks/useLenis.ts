import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '@/lib/gsapSetup'
import { setLenis } from '@/lib/scroll'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/**
 * Wires Lenis smooth scrolling into the GSAP ticker so ScrollTrigger
 * animations stay perfectly in sync with the scroll position.
 */
export function useLenis() {
  const reduced = useReducedMotion()
  const started = useRef(false)

  useEffect(() => {
    if (reduced || started.current) return
    started.current = true

    const lenis = new Lenis({ lerp: 0.11, smoothWheel: true })
    setLenis(lenis)
    lenis.on('scroll', ScrollTrigger.update)

    const raf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
      setLenis(null)
      started.current = false
    }
  }, [reduced])
}
