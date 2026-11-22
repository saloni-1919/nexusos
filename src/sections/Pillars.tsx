import type { ComponentType } from 'react'
import { Boxes, BarChart3, Workflow, BrainCircuit, Plug, ShieldCheck } from 'lucide-react'
import { SpotlightCard } from '@/components/reactbits/SpotlightCard'
import { SplitText } from '@/components/reactbits/SplitText'
import { Reveal } from '@/components/Reveal'
import { PILLARS } from '@/data/content'

const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  Boxes,
  BarChart3,
  Workflow,
  BrainCircuit,
  Plug,
  ShieldCheck,
}

export function Pillars() {
  return (
    <section id="platform" className="relative mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
      <div className="mb-14 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="mb-4 font-mono text-[12px] uppercase tracking-[0.22em] text-primary">The platform</p>
          <h2 className="max-w-2xl font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl">
            <SplitText text="One connected" />
            <br />
            <SplitText text="operating environment" delay={0.15} />
          </h2>
        </div>
        <p className="max-w-sm text-[15px] leading-relaxed text-muted-foreground">
          Six capabilities, one shared data model. No exporting from one tool
          to understand another — the transaction and the insight live in the same place.
        </p>
      </div>

      <Reveal className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" stagger={0.09}>
        {PILLARS.map((pillar) => {
          const Icon = ICONS[pillar.icon]
          return (
            <SpotlightCard
              key={pillar.title}
              className="group rounded-xl border border-border bg-card p-6 transition-colors duration-200 hover:border-primary/40 md:p-7"
            >
              <div className="mb-5 flex items-center justify-between">
                <Icon className="h-6 w-6 text-primary" />
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  {pillar.tag}
                </span>
              </div>
              <h3 className="font-display text-xl font-bold tracking-tight">{pillar.title}</h3>
              <p className="mt-3 text-[14.5px] leading-relaxed text-muted-foreground">{pillar.copy}</p>
            </SpotlightCard>
          )
        })}
      </Reveal>
    </section>
  )
}
