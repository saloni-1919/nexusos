import { useEffect, useRef } from 'react'
import { ArrowDown, RefreshCw } from 'lucide-react'
import { gsap } from '@/lib/gsapSetup'
import { scrollToId } from '@/lib/scroll'
import { SplitText } from '@/components/reactbits/SplitText'
import { CountUp } from '@/components/reactbits/CountUp'
import { Marquee } from '@/components/reactbits/Marquee'
import { Button } from '@/components/ui/button'
import { MODULES } from '@/data/content'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const HERO_KPIS = [
  { label: 'Revenue · Nov', value: 248.5, prefix: '$', suffix: 'k', decimals: 1 },
  { label: 'Gross margin', value: 31.6, prefix: '', suffix: '%', decimals: 1 },
  { label: 'On-time delivery', value: 94.2, prefix: '', suffix: '%', decimals: 1 },
] as const

export function Hero() {
  const panelRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = panelRef.current
    if (!el || reduced) return
    const ctx = gsap.context(() => {
      gsap.from(el.querySelectorAll('.hero-stat'), {
        y: 22,
        autoAlpha: 0,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.1,
        delay: 0.9,
      })
    }, el)
    return () => ctx.revert()
  }, [reduced])

  return (
    <section id="top" className="grain relative flex min-h-dvh flex-col overflow-hidden">
      {/* backdrop: grid + drifting glow */}
      <div className="bg-grid bg-grid-fade absolute inset-0" aria-hidden="true" />
      <div
        className="animate-glow-drift absolute -top-40 left-1/2 h-[560px] w-[860px] -translate-x-1/2 rounded-full opacity-25 blur-3xl"
        style={{ background: 'radial-gradient(closest-side, hsl(38 84% 56% / 0.5), transparent)' }}
        aria-hidden="true"
      />
      <div
        className="absolute right-[-120px] top-1/3 h-[380px] w-[380px] rounded-full opacity-15 blur-3xl"
        style={{ background: 'radial-gradient(closest-side, hsl(174 58% 48% / 0.6), transparent)' }}
        aria-hidden="true"
      />

      <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-5 pb-16 pt-32 md:px-8 md:pt-36">
        <p className="mb-6 font-mono text-[12px] uppercase tracking-[0.22em] text-primary">
          ERP · BI · Automation · AI — one operating environment
        </p>

        <h1 className="max-w-5xl text-balance font-display text-[13vw] font-bold leading-[0.98] tracking-tight sm:text-6xl md:text-7xl lg:text-[84px]">
          <SplitText text="Run the whole business" delay={0.1} />
          <br />
          <span className="text-primary">
            <SplitText text="from one platform." delay={0.45} />
          </span>
        </h1>

        <p className="mt-7 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
          Record the work. Trust the numbers. Automate the response. NexusOS unifies ERP,
          business intelligence, workflow automation and AI decision support — so actions
          create data, data becomes insight, and insight triggers controlled action.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-4">
          <Button
            onClick={() => scrollToId('#platform')}
            className="h-12 cursor-pointer rounded-md bg-primary px-7 font-mono text-[13px] font-medium uppercase tracking-[0.08em] text-primary-foreground transition-colors duration-200 hover:bg-primary/85"
          >
            Explore the platform
          </Button>
          <Button
            variant="outline"
            onClick={() => scrollToId('#pilot')}
            className="h-12 cursor-pointer rounded-md border-border bg-transparent px-7 font-mono text-[13px] font-medium uppercase tracking-[0.08em] text-foreground transition-colors duration-200 hover:bg-secondary"
          >
            See the pilot plan
          </Button>
        </div>

        {/* live scorecard preview */}
        <div
          ref={panelRef}
          className="mt-14 max-w-3xl rounded-xl border border-border bg-card/70 backdrop-blur-sm"
        >
          <div className="flex flex-col gap-1 border-b border-border px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Operational scorecard — illustrative data
            </span>
            <span className="flex items-center gap-1.5 font-mono text-[11px] text-signal">
              <RefreshCw className="h-3 w-3" aria-hidden="true" />
              Refreshed 4 min ago
            </span>
          </div>
          <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {HERO_KPIS.map((kpi) => (
              <div key={kpi.label} className="hero-stat px-5 py-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  {kpi.label}
                </p>
                <p className="mt-1 font-display text-2xl font-bold tracking-tight md:text-[28px]">
                  <CountUp to={kpi.value} prefix={kpi.prefix} suffix={kpi.suffix} decimals={kpi.decimals} />
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* scroll hint — in normal flow so it can never overlap the panel */}
      <div className="relative mt-10 hidden justify-center lg:flex" aria-hidden="true">
        <div className="flex flex-col items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Scroll</span>
          <div className="animate-scroll-hint h-10 w-px bg-primary" />
          <ArrowDown className="h-3.5 w-3.5 text-primary" />
        </div>
      </div>

      {/* module marquee */}
      <div className="relative mt-4 border-t border-border py-5">
        <Marquee speed={40}>
          {MODULES.map((m) => (
            <span key={m} className="flex items-center gap-10 font-mono text-[12px] uppercase tracking-[0.18em] text-muted-foreground">
              {m}
              <span className="h-1 w-1 rounded-full bg-primary" aria-hidden="true" />
            </span>
          ))}
        </Marquee>
      </div>

    </section>
  )
}
