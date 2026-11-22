import { useEffect, useRef } from 'react'
import { Repeat } from 'lucide-react'
import { gsap } from '@/lib/gsapSetup'
import { LOOP_STEPS } from '@/data/content'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/utils'

/**
 * The centerpiece: a pinned, scrubbed sequence walking the operating loop
 * Operate → Data → Insight → Action. Desktop pins the section and crossfades
 * the four stages; mobile renders the same content as a static stack.
 */
export function Loop() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap || reduced) return

    const mm = gsap.matchMedia()
    mm.add('(min-width: 1024px)', () => {
      const panels = gsap.utils.toArray<HTMLElement>('.loop-panel')
      const nodes = gsap.utils.toArray<HTMLElement>('.loop-node')
      const fill = wrap.querySelector<HTMLElement>('.loop-fill')

      gsap.set(panels, { autoAlpha: 0, y: 24 })
      gsap.set(panels[0], { autoAlpha: 1, y: 0 })
      if (fill) gsap.set(fill, { scaleY: 0 })

      const tl = gsap.timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: {
          trigger: wrap,
          start: 'top top',
          end: '+=2600',
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
        },
      })

      LOOP_STEPS.forEach((_, i) => {
        const at = i * 1.1
        if (i > 0) {
          tl.to(panels[i - 1], { autoAlpha: 0, y: -20, duration: 0.35 }, at)
          tl.to(panels[i], { autoAlpha: 1, y: 0, duration: 0.4 }, at + 0.15)
        }
        tl.to(nodes[i], { color: 'hsl(38 84% 56%)', borderColor: 'hsl(38 84% 56%)', duration: 0.2 }, at)
        if (fill) tl.to(fill, { scaleY: (i + 1) / LOOP_STEPS.length, duration: 1.0, ease: 'none' }, at)
      })

      return () => {
        tl.scrollTrigger?.kill()
        tl.kill()
      }
    })

    return () => mm.revert()
  }, [reduced])

  return (
    <section id="loop" ref={wrapRef} className="relative border-y border-border bg-card/40">
      <div className="mx-auto flex min-h-dvh max-w-7xl flex-col justify-center px-5 py-24 md:px-8">
        <div className="mb-12 flex items-center gap-3">
          <Repeat className="h-4 w-4 text-primary" aria-hidden="true" />
          <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-primary">The operating loop</p>
        </div>

        <div className="grid gap-12 lg:grid-cols-[220px_1fr] lg:gap-20">
          {/* spine */}
          <div className="relative hidden lg:block" aria-hidden="true">
            <div className="absolute left-[27px] top-2 bottom-2 w-px bg-border" />
            <div
              className="loop-fill absolute left-[27px] top-2 bottom-2 w-px origin-top bg-primary"
              style={{ transform: 'scaleY(0)' }}
            />
            <ol className="relative flex h-full flex-col justify-between">
              {LOOP_STEPS.map((step, i) => (
                <li key={step.id} className="flex items-center gap-4">
                  <span
                    className={cn(
                      'loop-node flex h-14 w-14 items-center justify-center rounded-full border bg-background font-mono text-[13px] transition-colors',
                      i === 0 ? 'border-primary text-primary' : 'border-border text-muted-foreground',
                    )}
                  >
                    {step.num}
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                    {step.title}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {/* panels */}
          <div className="relative">
            {/* desktop: crossfading stack */}
            {/* desktop: crossfading stack — only when animation is active */}
            {!reduced && (
              <div className="relative hidden min-h-[340px] lg:block">
                {LOOP_STEPS.map((step) => (
                  <article key={step.id} className="loop-panel absolute inset-0 flex flex-col justify-center">
                    <h3 className="max-w-2xl font-display text-4xl font-bold leading-[1.06] tracking-tight xl:text-[52px]">
                      {step.headline}
                    </h3>
                    <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
                      {step.copy}
                    </p>
                    <p className="mt-6 font-mono text-[12px] uppercase tracking-[0.16em] text-signal">
                      {step.detail}
                    </p>
                  </article>
                ))}
              </div>
            )}

            {/* static stack: mobile always; desktop too when reduced motion is on */}
            <div className={cn('flex flex-col gap-6', reduced ? '' : 'lg:hidden')}>
              {LOOP_STEPS.map((step) => (
                <article key={step.id} className="rounded-xl border border-border bg-card p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-primary font-mono text-[12px] text-primary">
                      {step.num}
                    </span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                      {step.title}
                    </span>
                  </div>
                  <h3 className="font-display text-2xl font-bold leading-tight tracking-tight">{step.headline}</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{step.copy}</p>
                  <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-signal">{step.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-14 max-w-md font-mono text-[12px] uppercase leading-relaxed tracking-[0.14em] text-muted-foreground">
          …and every controlled action becomes new operational data. The loop closes.
        </p>
      </div>
    </section>
  )
}
