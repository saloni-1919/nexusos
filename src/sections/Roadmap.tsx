import { SplitText } from '@/components/reactbits/SplitText'
import { Reveal } from '@/components/Reveal'
import { ROADMAP } from '@/data/content'

export function Roadmap() {
  return (
    <section id="roadmap" className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
      <div className="mb-14 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="mb-4 font-mono text-[12px] uppercase tracking-[0.22em] text-primary">Development roadmap</p>
          <h2 className="max-w-2xl font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl">
            <SplitText text="Narrow first." />
            <br />
            <span className="text-muted-foreground">
              <SplitText text="Then expand on evidence." delay={0.15} />
            </span>
          </h2>
        </div>
        <p className="max-w-sm text-[15px] leading-relaxed text-muted-foreground">
          A production-minded pilot takes roughly 9–15 months with a capable small team.
          Every phase has an exit criterion — no phase starts on enthusiasm alone.
        </p>
      </div>

      <Reveal className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" stagger={0.08}>
        {ROADMAP.map((phase) => (
          <article
            key={phase.phase}
            className="flex flex-col rounded-xl border border-border bg-card p-6 transition-colors duration-200 hover:border-primary/40"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[12px] uppercase tracking-[0.14em] text-primary">{phase.phase}</span>
              <span className="rounded-sm bg-secondary px-2 py-1 font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground">
                {phase.duration}
              </span>
            </div>
            <h3 className="mt-4 font-display text-xl font-bold tracking-tight">{phase.name}</h3>
            <p className="mt-3 flex-1 text-[14px] leading-relaxed text-muted-foreground">{phase.work}</p>
            <p className="mt-5 border-t border-border pt-4 font-mono text-[11.5px] uppercase leading-relaxed tracking-[0.08em] text-signal">
              Exit → {phase.exit}
            </p>
          </article>
        ))}
      </Reveal>
    </section>
  )
}
