import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsapSetup'
import { SplitText } from '@/components/reactbits/SplitText'
import { Reveal } from '@/components/Reveal'
import { SCORES } from '@/data/content'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export function Assessment() {
  const barsRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const wrap = barsRef.current
    if (!wrap || reduced) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.score-bar').forEach((bar) => {
        const target = bar.dataset.score ?? '0'
        gsap.fromTo(
          bar,
          { scaleX: 0 },
          {
            scaleX: Number(target) / 10,
            duration: 1.1,
            ease: 'power3.out',
            scrollTrigger: { trigger: bar, start: 'top 88%', once: true },
          },
        )
      })
    }, wrap)
    return () => ctx.revert()
  }, [reduced])

  return (
    <section id="assessment" className="border-y border-border bg-card/40">
      <div className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          <div>
            <p className="mb-4 font-mono text-[12px] uppercase tracking-[0.22em] text-primary">
              Honest assessment
            </p>
            <h2 className="font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl">
              <SplitText text="Hard to build." />
              <br />
              <span className="text-muted-foreground">
                <SplitText text="Worth building right." delay={0.15} />
              </span>
            </h2>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted-foreground">
              The idea is strong; the full vision is too broad for a first release. So the
              strategy is a narrow version on an architecture designed for expansion —
              record an event, calculate its impact, visualize it, recommend an action,
              execute an approved workflow.
            </p>
          </div>

          <Reveal y={20}>
            <div ref={barsRef} className="space-y-6">
              {SCORES.map((s) => (
                <div key={s.label}>
                  <div className="mb-2 flex items-baseline justify-between gap-4">
                    <p className="font-display text-[15px] font-medium">{s.label}</p>
                    <p className="font-mono text-[13px] text-primary">{s.score}/10</p>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="score-bar h-full origin-left rounded-full bg-primary"
                      data-score={s.score}
                      style={{ transform: `scaleX(${reduced ? s.score / 10 : 0})` }}
                      role="img"
                      aria-label={`${s.label}: ${s.score} out of 10`}
                    />
                  </div>
                  <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                    {s.note}
                  </p>
                </div>
              ))}
              <p className="pt-2 font-mono text-[10.5px] uppercase tracking-[0.1em] text-muted-foreground">
                Qualitative product-planning judgments — not independently measured scores.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
