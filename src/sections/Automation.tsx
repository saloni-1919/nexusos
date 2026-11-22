import { useEffect, useRef } from 'react'
import { Zap } from 'lucide-react'
import { gsap } from '@/lib/gsapSetup'
import { SplitText } from '@/components/reactbits/SplitText'
import { WORKFLOW_STEPS } from '@/data/content'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/**
 * Workflow automation: a vertical execution timeline whose spine draws
 * itself as you scroll — mirroring how a workflow run executes step by step.
 */
export function Automation() {
  const listRef = useRef<HTMLOListElement>(null)
  const fillRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const list = listRef.current
    const fill = fillRef.current
    if (!list || !fill || reduced) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        fill,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: { trigger: list, start: 'top 75%', end: 'bottom 55%', scrub: 0.4 },
        },
      )
      gsap.utils.toArray<HTMLElement>('.wf-step').forEach((step) => {
        gsap.from(step, {
          x: -24,
          autoAlpha: 0,
          duration: 0.6,
          ease: 'power3.out',
          scrollTrigger: { trigger: step, start: 'top 82%', once: true },
        })
      })
    }, list)
    return () => ctx.revert()
  }, [reduced])

  return (
    <section id="automation" className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="mb-4 flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.22em] text-primary">
            <Zap className="h-4 w-4" aria-hidden="true" />
            Workflow automation
          </p>
          <h2 className="font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl">
            <SplitText text="Don't just see the problem." />
            <br />
            <span className="text-muted-foreground">
              <SplitText text="Resolve it." delay={0.15} />
            </span>
          </h2>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted-foreground">
            A dashboard that only displays an overdue supplier order is half a product.
            NexusOS turns the event into a controlled workflow — with idempotency keys so
            retries never duplicate an order, durable state so runs survive a crash, and a
            human gate before anything irreversible happens.
          </p>
          <p className="mt-5 max-w-md font-mono text-[12px] uppercase leading-relaxed tracking-[0.12em] text-signal">
            Simulate before you activate. Roll back after you publish.
          </p>
        </div>

        <div className="relative">
          <div className="absolute bottom-2 left-[19px] top-2 w-px bg-border" aria-hidden="true" />
          <div
            ref={fillRef}
            className="absolute bottom-2 left-[19px] top-2 w-px origin-top bg-primary"
            style={{ transform: 'scaleY(1)' }}
            aria-hidden="true"
          />
          <ol ref={listRef} className="relative space-y-5">
            {WORKFLOW_STEPS.map((step, i) => (
              <li key={step.title} className="wf-step flex gap-5">
                <span className="relative z-10 mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/60 bg-background font-mono text-[12px] text-primary">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="flex-1 rounded-xl border border-border bg-card p-5 transition-colors duration-200 hover:border-primary/40 md:p-6">
                  <h3 className="font-display text-lg font-bold tracking-tight">{step.title}</h3>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-muted-foreground">{step.copy}</p>
                  <p className="mt-3 inline-block rounded-sm bg-secondary px-2 py-1 font-mono text-[10.5px] uppercase tracking-[0.1em] text-signal">
                    {step.badge}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
