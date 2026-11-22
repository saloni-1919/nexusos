import { useEffect, useMemo, useRef } from 'react'
import { Info, TrendingUp, AlertTriangle, AlertOctagon } from 'lucide-react'
import { gsap } from '@/lib/gsapSetup'
import { SplitText } from '@/components/reactbits/SplitText'
import { CountUp } from '@/components/reactbits/CountUp'
import { Reveal } from '@/components/Reveal'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { REVENUE_SERIES, SCORECARD_KPIS, type ScorecardKpi } from '@/data/content'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/utils'

const TONE = {
  good: { icon: TrendingUp, className: 'text-signal' },
  warn: { icon: AlertTriangle, className: 'text-primary' },
  bad: { icon: AlertOctagon, className: 'text-destructive' },
} as const

function KpiCard({ kpi }: { kpi: ScorecardKpi }) {
  const ToneIcon = TONE[kpi.tone].icon
  return (
    <article className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="font-mono text-[11.5px] uppercase tracking-[0.14em] text-muted-foreground">{kpi.label}</p>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label={`${kpi.label} — metric definition`}
            >
              <Info className="h-4 w-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 border-border bg-popover p-0">
            <div className="border-b border-border px-4 py-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-primary">
                Semantic layer record
              </p>
              <p className="mt-1 font-display text-[15px] font-bold">{kpi.label}</p>
            </div>
            <dl className="space-y-2.5 px-4 py-3.5">
              {(
                [
                  ['Formula', kpi.definition.formula],
                  ['Owner', kpi.definition.owner],
                  ['Source', kpi.definition.source],
                  ['Refresh', kpi.definition.refresh],
                ] as const
              ).map(([k, v]) => (
                <div key={k}>
                  <dt className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground">{k}</dt>
                  <dd className="font-mono text-[12px] leading-relaxed text-foreground">{v}</dd>
                </div>
              ))}
            </dl>
          </PopoverContent>
        </Popover>
      </div>
      <p className="mt-2 font-display text-[34px] font-bold leading-none tracking-tight">
        <CountUp to={kpi.value} decimals={kpi.decimals} prefix={kpi.prefix} suffix={kpi.suffix} />
      </p>
      <p className={cn('mt-3 flex items-center gap-1.5 font-mono text-[12px]', TONE[kpi.tone].className)}>
        <ToneIcon className="h-3.5 w-3.5" aria-hidden="true" />
        {kpi.note}
      </p>
    </article>
  )
}

function RevenueChart() {
  const pathRef = useRef<SVGPathElement>(null)
  const areaRef = useRef<SVGPathElement>(null)
  const dotsRef = useRef<SVGGElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  const W = 600
  const H = 240
  const PAD = { t: 20, r: 16, b: 30, l: 44 }
  const min = 150
  const max = 280

  const { line, area, points } = useMemo(() => {
    const x = (i: number) => PAD.l + (i * (W - PAD.l - PAD.r)) / (REVENUE_SERIES.length - 1)
    const y = (v: number) => PAD.t + (1 - (v - min) / (max - min)) * (H - PAD.t - PAD.b)
    const pts = REVENUE_SERIES.map((d, i) => ({ x: x(i), y: y(d.value), ...d }))
    const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
    const areaPath = `${linePath} L${x(REVENUE_SERIES.length - 1).toFixed(1)},${H - PAD.b} L${PAD.l},${H - PAD.b} Z`
    return { line: linePath, area: areaPath, points: pts }
  }, [])

  useEffect(() => {
    const path = pathRef.current
    const wrap = wrapRef.current
    if (!path || !wrap) return
    if (reduced) {
      // already fully drawn via attributes
      return
    }
    const len = path.getTotalLength()
    const ctx = gsap.context(() => {
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len })
      gsap.set(areaRef.current, { autoAlpha: 0 })
      gsap.set(dotsRef.current?.children ?? [], { autoAlpha: 0, scale: 0.4, transformOrigin: 'center' })
      const tl = gsap.timeline({
        scrollTrigger: { trigger: wrap, start: 'top 78%', once: true },
      })
      tl.to(path, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' })
      tl.to(areaRef.current, { autoAlpha: 1, duration: 0.8 }, '-=0.7')
      tl.to(dotsRef.current?.children ?? [], { autoAlpha: 1, scale: 1, duration: 0.35, stagger: 0.08, ease: 'back.out(2)' }, '-=0.9')
    }, wrap)
    return () => ctx.revert()
  }, [reduced])

  const gridValues = [150, 180, 210, 240, 270]
  const y = (v: number) => PAD.t + (1 - (v - min) / (max - min)) * (H - PAD.t - PAD.b)

  return (
    <div ref={wrapRef} className="rounded-xl border border-border bg-card p-5 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <p className="font-mono text-[11.5px] uppercase tracking-[0.14em] text-muted-foreground">
          Monthly revenue — $ thousands
        </p>
        <span className="font-mono text-[11px] text-muted-foreground">Illustrative</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Line chart of monthly revenue from June to November, rising from 178 to 248.5 thousand dollars">
        <defs>
          <linearGradient id="rev-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(38 84% 56%)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="hsl(38 84% 56%)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {gridValues.map((v) => (
          <g key={v}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} className="stroke-border" strokeDasharray="3 5" strokeWidth="1" />
            <text x={PAD.l - 8} y={y(v) + 4} textAnchor="end" className="fill-muted-foreground" fontSize="10" fontFamily="IBM Plex Mono, monospace">
              ${v}k
            </text>
          </g>
        ))}

        <path ref={areaRef} d={area} fill="url(#rev-fill)" />
        <path ref={pathRef} d={line} fill="none" className="stroke-primary" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

        <g ref={dotsRef}>
          {points.map((p) => (
            <g key={p.month}>
              <circle cx={p.x} cy={p.y} r="4.5" className="fill-background stroke-primary" strokeWidth="2.5">
                <title>{`${p.month}: $${p.value}k`}</title>
              </circle>
              <text x={p.x} y={H - 10} textAnchor="middle" className="fill-muted-foreground" fontSize="10.5" fontFamily="IBM Plex Mono, monospace">
                {p.month}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  )
}

export function Scorecard() {
  return (
    <section id="scorecard" className="border-y border-border bg-card/40">
      <div className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
        <div className="mb-12 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="mb-4 font-mono text-[12px] uppercase tracking-[0.22em] text-primary">
              KPI & reporting center
            </p>
            <h2 className="max-w-2xl font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl">
              <SplitText text="Every number carries" />
              <br />
              <SplitText text="its own definition." delay={0.15} />
            </h2>
          </div>
          <p className="max-w-sm text-[15px] leading-relaxed text-muted-foreground">
            Targets, thresholds, trend comparisons, ownership and freshness on every scorecard.
            Open any metric to inspect its formula — live reports never silently rewrite an
            approved historical snapshot.
          </p>
        </div>

        <Reveal className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" stagger={0.09}>
          {SCORECARD_KPIS.map((kpi) => (
            <KpiCard key={kpi.id} kpi={kpi} />
          ))}
        </Reveal>

        <div className="mt-4">
          <RevenueChart />
        </div>
      </div>
    </section>
  )
}
