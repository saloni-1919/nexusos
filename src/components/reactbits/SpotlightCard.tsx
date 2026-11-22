import { useRef, type HTMLAttributes, type MouseEvent } from 'react'
import { cn } from '@/lib/utils'

/**
 * React Bits-style spotlight card: a radial highlight follows the cursor.
 * Pure CSS variables + transform-free paint, so it stays cheap.
 */
export function SpotlightCard({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null)

  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`)
    el.style.setProperty('--my', `${e.clientY - rect.top}px`)
  }

  return (
    <div ref={ref} onMouseMove={onMouseMove} className={cn('spotlight-card', className)} {...props}>
      {children}
    </div>
  )
}
