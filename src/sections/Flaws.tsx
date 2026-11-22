import { ShieldAlert, ArrowRight } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { SplitText } from '@/components/reactbits/SplitText'
import { Reveal } from '@/components/Reveal'
import { FLAWS } from '@/data/content'

export function Flaws() {
  return (
    <section id="flaws" className="border-y border-border bg-card/40">
      <div className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="mb-4 flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.22em] text-destructive">
              <ShieldAlert className="h-4 w-4" aria-hidden="true" />
              Known failure modes
            </p>
            <h2 className="font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl">
              <SplitText text="Five dangerous flaws" />
              <br />
              <span className="text-muted-foreground">
                <SplitText text="engineered out." delay={0.15} />
              </span>
            </h2>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted-foreground">
              Most platforms in this category fail in predictable ways. Each one below is a
              design constraint in NexusOS, not a footnote. Expand each flaw to see the
              mitigation built into the product.
            </p>
          </div>

          <Reveal y={20}>
            <Accordion type="single" collapsible className="w-full">
              {FLAWS.map((flaw, i) => (
                <AccordionItem key={flaw.title} value={`flaw-${i}`} className="border-border">
                  <AccordionTrigger className="cursor-pointer py-5 text-left hover:no-underline">
                    <span className="flex items-baseline gap-4">
                      <span className="font-mono text-[12px] text-destructive">F{i + 1}</span>
                      <span className="font-display text-lg font-bold tracking-tight md:text-xl">
                        {flaw.title}
                      </span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 pl-9 pr-2">
                    <p className="text-[14.5px] leading-relaxed text-muted-foreground">{flaw.risk}</p>
                    <p className="mt-4 flex gap-2.5 rounded-lg border border-signal/30 bg-signal/5 p-4 text-[14px] leading-relaxed text-foreground">
                      <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-signal" aria-hidden="true" />
                      <span>{flaw.fix}</span>
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
