import type Lenis from 'lenis'

let lenisInstance: Lenis | null = null

export function setLenis(instance: Lenis | null) {
  lenisInstance = instance
}

export function getLenis() {
  return lenisInstance
}

/** Smooth-scroll to an in-page anchor. Falls back to native scrolling. */
export function scrollToId(hash: string) {
  const el = document.querySelector(hash)
  if (!el) return
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (lenisInstance && !reduced) {
    lenisInstance.scrollTo(el as HTMLElement, { offset: -72, duration: 1.2 })
  } else {
    ;(el as HTMLElement).scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
  }
}
