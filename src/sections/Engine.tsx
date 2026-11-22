import { SplitText } from '@/components/reactbits/SplitText'
import { Reveal } from '@/components/Reveal'
import { ANALYTICS_LEVELS, KPI_REGISTRY } from '@/data/content'

export function Engine() {
  return (
    <section id="engine" className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
      <p className="mb-4 font-mono text-[12px] uppercase tracking-[0.22em] text-primary">The analytics engine</p>
      <h2 className="max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl">
        <SplitText text="Four levels of intelligence," />
        <br />
        <span className="text-muted-foreground">
          <SplitText text="one source of truth." delay={0.15} />
        </span>
      </h2>

      <Reveal className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" stagger={0.1}>
        {ANALYTICS_LEVELS.map((level) => (
          <article
            key={level.num}
            className="group flex flex-col rounded-xl border border-border bg-card p-6 transition-colors duration-200 hover:border-primary/40"
          >
            <span className="font-mono text-[13px] text-primary">{level.num}</span>
            <h3 className="mt-4 font-display text-xl font-bold tracking-tight">{level.name}</h3>
            <p className="mt-1 font-mono text-[12px] uppercase tracking-[0.1em] text-signal">{level.question}</p>
            <p className="mt-4 border-t border-border pt-4 text-[14px] leading-relaxed text-muted-foreground">
              “{level.example}”
            </p>
          </article>
        ))}
      </Reveal>

      {/* semantic layer */}
      <div className="mt-20 grid items-start gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div>
          <h3 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
            The semantic layer: every KPI, defined once.
          </h3>
          <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
            When sales calculates revenue from invoiced sales and finance uses recognized
            sales, both call it “Revenue” — and both are right about different numbers.
            NexusOS keeps a central metric registry: what each KPI means, how it is
            calculated, where the data comes from and who owns it. Versioned definitions,
            reporting calendars, currencies and null-handling rules included.
          </p>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
            Because an incorrect KPI costs more than a missing dashboard.
          </p>
        </div>

        <Reveal y={20}>
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="border-b border-border px-5 py-3.5">
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                Metric registry — live record
              </span>
            </div>
            <dl className="divide-y divide-border">
              {KPI_REGISTRY.map((row) => (
                <div key={row.attr} className="grid grid-cols-[110px_1fr] gap-3 px-5 py-3 sm:grid-cols-[150px_1fr]">
                  <dt className="font-mono text-[11.5px] uppercase tracking-[0.1em] text-muted-foreground">
                    {row.attr}
                  </dt>
                  <dd className="font-mono text-[12.5px] leading-relaxed text-foreground">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
