import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface MarqueeProps {
  children: ReactNode
  className?: string
  /** seconds for one full loop */
  speed?: number
}

/**
 * React Bits-style infinite marquee. Content is duplicated once so the
 * -50% translate loops seamlessly; the duplicate is aria-hidden.
 */
export function Marquee({ children, className, speed = 36 }: MarqueeProps) {
  return (
    <div className={cn('marquee-paused overflow-hidden', className)}>
      <div className="animate-marquee flex w-max" style={{ animationDuration: `${speed}s` }}>
        <div className="flex items-center gap-10 pr-10">{children}</div>
        <div className="flex items-center gap-10 pr-10" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  )
}
