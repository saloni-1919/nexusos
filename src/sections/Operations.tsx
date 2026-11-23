import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { PackagePlus, Check, Truck, RotateCcw, Boxes, CircleDot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SplitText } from '@/components/reactbits/SplitText'
import { Reveal } from '@/components/Reveal'
import { computeKpis, type POStatus } from '@/lib/ops'
import { useOps } from '@/lib/opsStore'
import { cn } from '@/lib/utils'

const STATUS_STYLE: Record<POStatus, string> = {
  pending: 'bg-primary/15 text-primary',
  approved: 'bg-signal/15 text-signal',
  received: 'bg-secondary text-muted-foreground',
}

export function Operations() {
  const { state, createPO, approvePO, receivePO, resetDemo } = useOps()
  const [supplierId, setSupplierId] = useState('')
  const [productSku, setProductSku] = useState('')
  const [qty, setQty] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  // hydrate form defaults once state is known
  useEffect(() => {
    if (!supplierId && state.suppliers[0]) setSupplierId(state.suppliers[0].id)
    if (!productSku && state.products[0]) setProductSku(state.products[0].sku)
  }, [state, supplierId, productSku])

  const kpis = useMemo(() => computeKpis(state), [state])
  const product = state.products.find((p) => p.sku === productSku)
  const qtyNum = Number(qty)
  const estTotal = product && qtyNum > 0 ? Math.round(qtyNum * product.unitCost * 100) / 100 : null

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!supplierId || !productSku) return setFormError('Choose a supplier and a product.')
    if (!Number.isFinite(qtyNum) || qtyNum <= 0 || !Number.isInteger(qtyNum))
      return setFormError('Quantity must be a positive whole number.')
    setFormError(null)
    createPO(supplierId, productSku, qtyNum)
    setQty('')
  }

  return (
    <section id="operations" className="border-y border-border bg-card/40">
      <div className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
        <div className="mb-12 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="mb-4 flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.22em] text-primary">
              <Boxes className="h-4 w-4" aria-hidden="true" />
              Live demo — operations core
            </p>
            <h2 className="max-w-2xl font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl">
              <SplitText text="Run a purchase order" />
              <br />
              <span className="text-muted-foreground">
                <SplitText text="through the loop." delay={0.15} />
              </span>
            </h2>
          </div>
          <p className="max-w-sm text-[15px] leading-relaxed text-muted-foreground">
            Create a PO, approve it, receive it — and watch inventory and KPIs update in the
            same motion. State persists in your browser; nothing leaves the tab.
          </p>
        </div>

        {/* KPI strip — reacts to every action */}
        <Reveal className="grid grid-cols-2 gap-4 lg:grid-cols-4" stagger={0.07}>
          {[
            { label: 'Open order value', value: `$${kpis.openOrderValue.toLocaleString()}`, tone: 'text-foreground' },
            { label: 'Pending approvals', value: String(kpis.pendingApprovals), tone: kpis.pendingApprovals > 0 ? 'text-primary' : 'text-foreground' },
            { label: 'Low-stock products', value: String(kpis.lowStock), tone: kpis.lowStock > 0 ? 'text-destructive' : 'text-signal' },
            { label: 'POs received', value: String(kpis.receivedThisSession), tone: 'text-signal' },
          ].map((k) => (
            <div key={k.label} className="rounded-xl border border-border bg-card p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{k.label}</p>
              <p className={cn('mt-2 font-display text-[28px] font-bold leading-none tracking-tight', k.tone)}>
                {k.value}
              </p>
            </div>
          ))}
        </Reveal>

        <div className="mt-4 grid gap-4 lg:grid-cols-[380px_1fr_300px]">
          {/* create PO form */}
          <Reveal y={20}>
            <form onSubmit={submit} className="rounded-xl border border-border bg-card p-5" noValidate>
              <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                New purchase order
              </p>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="op-supplier" className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-muted-foreground">
                    Supplier
                  </Label>
                  <select
                    id="op-supplier"
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="mt-1.5 block h-11 w-full cursor-pointer rounded-md border border-input bg-background px-3 font-mono text-[12.5px] text-foreground"
                  >
                    {state.suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="op-product" className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-muted-foreground">
                    Product
                  </Label>
                  <select
                    id="op-product"
                    value={productSku}
                    onChange={(e) => setProductSku(e.target.value)}
                    className="mt-1.5 block h-11 w-full cursor-pointer rounded-md border border-input bg-background px-3 font-mono text-[12.5px] text-foreground"
                  >
                    {state.products.map((p) => (
                      <option key={p.sku} value={p.sku}>
                        {p.name} — ${p.unitCost.toFixed(2)}
                      </option>
                    ))}
                  </select>
                  {product && (
                    <p className="mt-1.5 font-mono text-[11px] text-muted-foreground">
                      Stock {product.stock} · reorder point {product.reorderPoint}
                      {product.stock < product.reorderPoint && (
                        <span className="text-destructive"> — below threshold</span>
                      )}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="op-qty" className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-muted-foreground">
                    Quantity
                  </Label>
                  <Input
                    id="op-qty"
                    type="number"
                    min={1}
                    step={1}
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    placeholder="e.g. 50"
                    className="mt-1.5 h-11 border-input bg-background font-mono"
                    aria-invalid={!!formError}
                    aria-describedby={formError ? 'op-err' : undefined}
                  />
                </div>
                {estTotal !== null && (
                  <p className="font-mono text-[12px] text-signal">
                    Estimated total: ${estTotal.toLocaleString()}
                  </p>
                )}
                {formError && (
                  <p id="op-err" className="text-[12.5px] text-destructive" role="alert">
                    {formError}
                  </p>
                )}
                <Button
                  type="submit"
                  className="h-11 w-full cursor-pointer rounded-md bg-primary font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-primary-foreground hover:bg-primary/85"
                >
                  <PackagePlus className="mr-2 h-4 w-4" aria-hidden="true" />
                  Create PO
                </Button>
              </div>
            </form>
          </Reveal>

          {/* orders table */}
          <Reveal y={20} delay={0.08}>
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  Purchase orders — {state.orders.length}
                </span>
                <button
                  type="button"
                  onClick={resetDemo}
                  className="flex cursor-pointer items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:text-foreground"
                >
                  <RotateCcw className="h-3 w-3" aria-hidden="true" />
                  Reset demo
                </button>
              </div>
              <ul className="divide-y divide-border">
                {state.orders.map((o) => {
                  const p = state.products.find((x) => x.sku === o.productSku)
                  const s = state.suppliers.find((x) => x.id === o.supplierId)
                  return (
                    <li key={o.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5">
                      <span className="font-mono text-[12.5px] font-medium text-foreground">{o.id}</span>
                      <span className="min-w-0 flex-1 truncate text-[13px] text-muted-foreground">
                        {o.qty} × {p?.name} · {s?.name} · ${o.total.toLocaleString()}
                      </span>
                      <span className={cn('rounded-sm px-2 py-0.5 font-mono text-[10.5px] uppercase tracking-[0.08em]', STATUS_STYLE[o.status])}>
                        {o.status}
                      </span>
                      {o.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => approvePO(o.id)}
                          className="h-8 cursor-pointer rounded-md bg-primary px-3 font-mono text-[11px] uppercase tracking-[0.06em] text-primary-foreground hover:bg-primary/85"
                        >
                          <Check className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                          Approve
                        </Button>
                      )}
                      {o.status === 'approved' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => receivePO(o.id)}
                          className="h-8 cursor-pointer rounded-md border-signal/50 bg-transparent px-3 font-mono text-[11px] uppercase tracking-[0.06em] text-signal hover:bg-signal/10"
                        >
                          <Truck className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                          Receive
                        </Button>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          </Reveal>

          {/* inventory + audit feed */}
          <Reveal y={20} delay={0.16} className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="border-b border-border px-5 py-3.5">
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  Inventory
                </span>
              </div>
              <ul className="divide-y divide-border">
                {state.products.map((p) => {
                  const low = p.stock < p.reorderPoint
                  const pct = Math.min(p.stock / (p.reorderPoint * 2), 1)
                  return (
                    <li key={p.sku} className="px-5 py-3">
                      <div className="flex items-baseline justify-between">
                        <span className="text-[13px] text-foreground">{p.name}</span>
                        <span className={cn('font-mono text-[12px]', low ? 'text-destructive' : 'text-muted-foreground')}>
                          {p.stock}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
                        <div
                          className={cn('h-full rounded-full transition-[width] duration-500', low ? 'bg-destructive' : 'bg-signal')}
                          style={{ width: `${pct * 100}%` }}
                          role="img"
                          aria-label={`${p.name} stock ${p.stock}, reorder point ${p.reorderPoint}`}
                        />
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="border-b border-border px-5 py-3.5">
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  Audit feed
                </span>
              </div>
              <ul className="max-h-[220px] space-y-2.5 overflow-auto px-5 py-4">
                {state.events.map((ev, i) => (
                  <li key={`${ev.at}-${i}`} className="flex gap-2.5 text-[12px] leading-relaxed">
                    <CircleDot
                      className={cn(
                        'mt-0.5 h-3 w-3 shrink-0',
                        ev.tone === 'ok' ? 'text-signal' : ev.tone === 'warn' ? 'text-destructive' : 'text-primary',
                      )}
                      aria-hidden="true"
                    />
                    <span className="text-muted-foreground">
                      <span className="font-mono text-[10.5px] text-muted-foreground/70">{ev.at} </span>
                      {ev.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
