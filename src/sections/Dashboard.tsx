import { useMemo } from 'react'
import { BellRing, X, LayoutDashboard, PackagePlus, FileDown, ArrowRight } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { SplitText } from '@/components/reactbits/SplitText'
import { Reveal } from '@/components/Reveal'
import { activeAlerts, openPoForProduct, reorderQty } from '@/lib/ops'
import { buildReportMarkdown, reportFileName } from '@/lib/report'
import { useOps } from '@/lib/opsStore'
import { cn } from '@/lib/utils'

const AXIS_TICK = { fill: 'hsl(219 12% 62%)', fontSize: 11, fontFamily: 'IBM Plex Mono, monospace' }
const GRID = 'hsl(220 14% 16%)'
const TOOLTIP_STYLE = {
  background: 'hsl(220 24% 8%)',
  border: '1px solid hsl(220 14% 16%)',
  borderRadius: 8,
  fontFamily: 'IBM Plex Mono, monospace',
  fontSize: 12,
}
const STATUS_COLORS: Record<string, string> = {
  pending: 'hsl(38 84% 56%)',
  approved: 'hsl(174 58% 48%)',
  received: 'hsl(219 12% 62%)',
}

export function Dashboard() {
  const { state, dismissAlert, reorderPO } = useOps()
  const alerts = useMemo(() => activeAlerts(state), [state])

  const exportReport = () => {
    const blob = new Blob([buildReportMarkdown(state)], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = reportFileName()
    a.click()
    URL.revokeObjectURL(url)
  }

  const spendBySupplier = useMemo(() => {
    const map = new Map<string, number>()
    state.orders.forEach((o) => {
      const name = state.suppliers.find((s) => s.id === o.supplierId)?.name ?? o.supplierId
      map.set(name, (map.get(name) ?? 0) + o.total)
    })
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }))
  }, [state])

  const stockData = useMemo(
    () =>
      state.products.map((p) => ({
        name: p.name,
        stock: p.stock,
        reorder: p.reorderPoint,
      })),
    [state],
  )

  const statusData = useMemo(() => {
    const counts: Record<string, number> = { pending: 0, approved: 0, received: 0 }
    state.orders.forEach((o) => {
      counts[o.status] += 1
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [state])

  return (
    <section id="dashboard" className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
      <div className="mb-12 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="mb-4 flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.22em] text-primary">
            <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
            Live demo — operational dashboard
          </p>
          <h2 className="max-w-2xl font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl">
            <SplitText text="The dashboard reads" />
            <br />
            <span className="text-muted-foreground">
              <SplitText text="your transactions." delay={0.15} />
            </span>
          </h2>
        </div>
        <p className="max-w-sm text-[15px] leading-relaxed text-muted-foreground">
          No mock data here — every chart below renders from the purchase orders and
          inventory you created in the Operations demo above. Threshold alerts fire
          automatically, and one click turns an alert into an approval-gated reorder PO.
        </p>
      </div>

      {/* report export */}
      <Reveal y={12}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-5 py-4">
          <p className="text-[13.5px] text-muted-foreground">
            <span className="font-medium text-foreground">Management snapshot</span> — KPIs, inventory position,
            open POs and active alerts, compiled from live state.
          </p>
          <button
            type="button"
            onClick={exportReport}
            className="flex h-9 cursor-pointer items-center gap-2 rounded-md border border-border bg-transparent px-4 font-mono text-[11px] uppercase tracking-[0.08em] text-foreground transition-colors hover:bg-secondary"
          >
            <FileDown className="h-3.5 w-3.5" aria-hidden="true" />
            Export report (.md)
          </button>
        </div>
      </Reveal>

      {/* threshold alerts */}
      <Reveal y={16}>
        <div
          className={cn(
            'mb-4 rounded-xl border p-5',
            alerts.length > 0 ? 'border-destructive/40 bg-destructive/5' : 'border-signal/30 bg-signal/5',
          )}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-2.5">
            <BellRing className={cn('h-4 w-4', alerts.length > 0 ? 'text-destructive' : 'text-signal')} aria-hidden="true" />
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Threshold alerts — {alerts.length} active
            </p>
          </div>
          {alerts.length === 0 ? (
            <p className="mt-3 text-[14px] text-signal">
              All products are above their reorder points. No action needed.
            </p>
          ) : (
            <ul className="mt-3 space-y-2.5">
              {alerts.map((p) => {
                const openPo = openPoForProduct(state, p.sku)
                return (
                  <li
                    key={p.sku}
                    className="flex flex-wrap items-center gap-3 rounded-lg border border-destructive/25 bg-background/60 px-4 py-3"
                  >
                    <span className="text-[13.5px] text-foreground">
                      <span className="font-medium">{p.name}</span> is below its reorder point:{' '}
                      <span className="font-mono text-destructive">{p.stock} in stock</span>
                      <span className="font-mono text-muted-foreground"> / {p.reorderPoint} threshold</span>
                    </span>
                    <span className="ml-auto flex flex-wrap items-center gap-2">
                      {openPo ? (
                        <span className="flex items-center gap-1.5 rounded-md border border-signal/40 bg-signal/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.06em] text-signal">
                          <ArrowRight className="h-3 w-3" aria-hidden="true" />
                          {openPo.id} {openPo.status}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => reorderPO(p.sku)}
                          className="flex h-8 cursor-pointer items-center gap-1.5 rounded-md bg-primary px-3 font-mono text-[11px] uppercase tracking-[0.06em] text-primary-foreground transition-colors hover:bg-primary/85"
                          aria-label={`Auto-create reorder PO for ${p.name}`}
                        >
                          <PackagePlus className="h-3.5 w-3.5" aria-hidden="true" />
                          Auto-reorder {reorderQty(p)} units
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => dismissAlert(p.sku)}
                        className="flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-border px-3 font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        aria-label={`Dismiss low-stock alert for ${p.name}`}
                      >
                        <X className="h-3 w-3" aria-hidden="true" />
                        Acknowledge
                      </button>
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </Reveal>

      {/* charts */}
      <Reveal className="grid gap-4 lg:grid-cols-3" stagger={0.09}>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            PO value by supplier
          </p>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spendBySupplier} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 5" stroke={GRID} vertical={false} />
                <XAxis dataKey="name" tick={AXIS_TICK} stroke={GRID} tickFormatter={(v: string) => v.split(' ')[0]} />
                <YAxis tick={AXIS_TICK} stroke={GRID} width={52} />
                <Tooltip cursor={{ fill: 'hsl(220 16% 14% / 0.5)' }} contentStyle={TOOLTIP_STYLE} labelStyle={{ color: 'hsl(44 22% 92%)' }} itemStyle={{ color: 'hsl(38 84% 56%)' }} />
                <Bar dataKey="value" name="PO value ($)" fill="hsl(38 84% 56%)" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            Stock vs reorder point
          </p>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 5" stroke={GRID} vertical={false} />
                <XAxis dataKey="name" tick={AXIS_TICK} stroke={GRID} tickFormatter={(v: string) => v.split(' ')[0]} />
                <YAxis tick={AXIS_TICK} stroke={GRID} width={40} />
                <Tooltip cursor={{ fill: 'hsl(220 16% 14% / 0.5)' }} contentStyle={TOOLTIP_STYLE} labelStyle={{ color: 'hsl(44 22% 92%)' }} />
                <Legend wrapperStyle={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11 }} />
                <Bar dataKey="stock" name="In stock" fill="hsl(174 58% 48%)" radius={[4, 4, 0, 0]} maxBarSize={26} />
                <Bar dataKey="reorder" name="Reorder point" fill="hsl(4 72% 56% / 0.55)" radius={[4, 4, 0, 0]} maxBarSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            PO pipeline
          </p>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={56}
                  outerRadius={86}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {statusData.map((s) => (
                    <Cell key={s.name} fill={STATUS_COLORS[s.name]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: 'hsl(44 22% 92%)' }} />
                <Legend wrapperStyle={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
