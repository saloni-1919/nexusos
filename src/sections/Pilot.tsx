import { useState, type FormEvent } from 'react'
import { CheckCircle2, Circle, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { SplitText } from '@/components/reactbits/SplitText'
import { Reveal } from '@/components/Reveal'
import { PILOT_STEPS } from '@/data/content'

interface FormState {
  name: string
  company: string
  email: string
  bottleneck: string
}

type Errors = Partial<Record<keyof FormState, string>>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function PilotDialog() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<FormState>({ name: '', company: '', email: '', bottleneck: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle')

  const validate = (): boolean => {
    const next: Errors = {}
    if (!form.name.trim()) next.name = 'Your name is required.'
    if (!form.company.trim()) next.company = 'Company is required.'
    if (!EMAIL_RE.test(form.email.trim())) next.email = 'Enter a valid work email.'
    if (form.bottleneck.trim().length < 10) next.bottleneck = 'Describe the bottleneck in at least 10 characters.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setStatus('sending')
    // Frontend-only pilot intake: persisted locally, no fake network call.
    window.setTimeout(() => {
      try {
        const existing = JSON.parse(localStorage.getItem('nexusos-pilot-requests') ?? '[]')
        existing.push({ ...form, at: new Date().toISOString() })
        localStorage.setItem('nexusos-pilot-requests', JSON.stringify(existing))
      } catch {
        /* storage unavailable — success state still shown */
      }
      setStatus('done')
    }, 700)
  }

  const reset = () => {
    setForm({ name: '', company: '', email: '', bottleneck: '' })
    setErrors({})
    setStatus('idle')
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) window.setTimeout(reset, 250)
      }}
    >
      <DialogTrigger asChild>
        <Button className="h-12 cursor-pointer rounded-md bg-primary px-8 font-mono text-[13px] font-medium uppercase tracking-[0.08em] text-primary-foreground transition-colors duration-200 hover:bg-primary/85">
          Request pilot access
        </Button>
      </DialogTrigger>
      <DialogContent className="border-border bg-popover sm:max-w-md">
        {status === 'done' ? (
          <div className="flex flex-col items-center py-6 text-center">
            <CheckCircle2 className="h-10 w-10 text-signal" aria-hidden="true" />
            <DialogTitle className="mt-4 font-display text-xl font-bold">Request received</DialogTitle>
            <DialogDescription className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
              Your pilot request has been recorded. We will reply to{' '}
              <span className="text-foreground">{form.email}</span> with the discovery-call schedule.
            </DialogDescription>
            <Button
              onClick={() => setOpen(false)}
              className="mt-6 h-11 cursor-pointer rounded-md bg-primary px-6 font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-primary-foreground hover:bg-primary/85"
            >
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate>
            <DialogTitle className="font-display text-xl font-bold">Request pilot access</DialogTitle>
            <DialogDescription className="mt-1.5 text-[13.5px] text-muted-foreground">
              Tell us where your reporting hurts most. Pilots are limited to distribution and
              inventory-led businesses.
            </DialogDescription>

            <div className="mt-5 space-y-4">
              <div>
                <Label htmlFor="pilot-name" className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                  Name
                </Label>
                <Input
                  id="pilot-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1.5 h-11 border-input bg-background"
                  autoComplete="name"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'pilot-name-err' : undefined}
                />
                {errors.name && <p id="pilot-name-err" className="mt-1.5 text-[12.5px] text-destructive">{errors.name}</p>}
              </div>
              <div>
                <Label htmlFor="pilot-company" className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                  Company
                </Label>
                <Input
                  id="pilot-company"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  className="mt-1.5 h-11 border-input bg-background"
                  autoComplete="organization"
                  aria-invalid={!!errors.company}
                  aria-describedby={errors.company ? 'pilot-company-err' : undefined}
                />
                {errors.company && <p id="pilot-company-err" className="mt-1.5 text-[12.5px] text-destructive">{errors.company}</p>}
              </div>
              <div>
                <Label htmlFor="pilot-email" className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                  Work email
                </Label>
                <Input
                  id="pilot-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="mt-1.5 h-11 border-input bg-background"
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'pilot-email-err' : undefined}
                />
                {errors.email && <p id="pilot-email-err" className="mt-1.5 text-[12.5px] text-destructive">{errors.email}</p>}
              </div>
              <div>
                <Label htmlFor="pilot-bottleneck" className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                  Biggest operational bottleneck
                </Label>
                <Textarea
                  id="pilot-bottleneck"
                  value={form.bottleneck}
                  onChange={(e) => setForm({ ...form, bottleneck: e.target.value })}
                  className="mt-1.5 min-h-[88px] border-input bg-background"
                  placeholder="e.g. Monthly reporting takes 6 days of manual reconciliation…"
                  aria-invalid={!!errors.bottleneck}
                  aria-describedby={errors.bottleneck ? 'pilot-bottleneck-err' : undefined}
                />
                {errors.bottleneck && (
                  <p id="pilot-bottleneck-err" className="mt-1.5 text-[12.5px] text-destructive">{errors.bottleneck}</p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={status === 'sending'}
              className="mt-6 h-12 w-full cursor-pointer rounded-md bg-primary font-mono text-[13px] font-medium uppercase tracking-[0.08em] text-primary-foreground transition-colors duration-200 hover:bg-primary/85 disabled:opacity-60"
            >
              {status === 'sending' ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Sending…
                </span>
              ) : (
                'Submit pilot request'
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

export function Pilot() {
  return (
    <section id="pilot" className="grain relative overflow-hidden">
      <div
        className="absolute left-1/2 top-0 h-[420px] w-[820px] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(closest-side, hsl(38 84% 56% / 0.55), transparent)' }}
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
        <div className="grid items-start gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <div>
            <p className="mb-4 font-mono text-[12px] uppercase tracking-[0.22em] text-primary">The first milestone</p>
            <h2 className="font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-[56px]">
              <SplitText text="One workflow," />
              <br />
              <span className="text-primary">
                <SplitText text="end to end." delay={0.15} />
              </span>
            </h2>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">
              No payroll, no manufacturing, no hundred connectors. The pilot proves a single
              loop: a purchase order flows from creation to a scheduled management report —
              with inventory, analytics, alerts and approvals working together.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <PilotDialog />
              <p className="font-mono text-[11.5px] uppercase leading-relaxed tracking-[0.1em] text-muted-foreground">
                8 steps · 1 loop · 0 silent data changes
              </p>
            </div>
          </div>

          <Reveal y={18} stagger={0.06}>
            <ol className="space-y-2.5">
              {PILOT_STEPS.map((step, i) => (
                <li
                  key={step}
                  className="flex items-center gap-4 rounded-lg border border-border bg-card/80 px-4 py-3.5 backdrop-blur-sm"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-primary/50 font-mono text-[11px] text-primary">
                    {i + 1}
                  </span>
                  <span className="text-[14.5px] leading-snug text-foreground">{step}</span>
                  <Circle className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground/50" aria-hidden="true" />
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
