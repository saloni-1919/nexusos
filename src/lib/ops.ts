export type POStatus = 'pending' | 'approved' | 'received'

export interface Supplier {
  id: string
  name: string
}

export interface Product {
  sku: string
  name: string
  stock: number
  reorderPoint: number
  unitCost: number
  /** preferred supplier used by the auto-reorder corrective workflow */
  supplierId: string
}

export interface PurchaseOrder {
  id: string
  supplierId: string
  productSku: string
  qty: number
  status: POStatus
  createdAt: string
  total: number
}

export interface OpsEvent {
  at: string
  text: string
  tone: 'info' | 'ok' | 'warn'
}

export interface OpsState {
  suppliers: Supplier[]
  products: Product[]
  orders: PurchaseOrder[]
  events: OpsEvent[]
  nextPoNum: number
  /** product SKUs whose low-stock alert has been dismissed; re-arms when stock recovers */
  dismissedAlerts: string[]
}

export const OPS_KEY = 'nexusos-ops-v1'

function now() {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export function initialOpsState(): OpsState {
  return {
    nextPoNum: 1020,
    suppliers: [
      { id: 'SUP-01', name: 'Nordvik Components' },
      { id: 'SUP-02', name: 'Atlas Packaging Co' },
      { id: 'SUP-03', name: 'Meridian Metals' },
    ],
    products: [
      { sku: 'WDG-A', name: 'Widget A', stock: 34, reorderPoint: 50, unitCost: 42.0, supplierId: 'SUP-01' },
      { sku: 'WDG-B', name: 'Widget B', stock: 120, reorderPoint: 60, unitCost: 28.5, supplierId: 'SUP-01' },
      { sku: 'GDG-X', name: 'Gadget X', stock: 12, reorderPoint: 40, unitCost: 96.75, supplierId: 'SUP-03' },
      { sku: 'CMP-Z', name: 'Component Z', stock: 210, reorderPoint: 80, unitCost: 11.2, supplierId: 'SUP-02' },
    ],
    orders: [
      {
        id: 'PO-1018',
        supplierId: 'SUP-01',
        productSku: 'WDG-B',
        qty: 100,
        status: 'approved',
        createdAt: '09:12:40',
        total: 2850,
      },
      {
        id: 'PO-1019',
        supplierId: 'SUP-03',
        productSku: 'GDG-X',
        qty: 40,
        status: 'pending',
        createdAt: '10:03:15',
        total: 3870,
      },
    ],
    events: [
      { at: '10:03:15', text: 'PO-1019 created — awaiting approval', tone: 'info' },
      { at: '09:12:40', text: 'PO-1018 approved by Finance', tone: 'ok' },
    ],
    dismissedAlerts: [],
  }
}

export function loadOpsState(): OpsState {
  try {
    const raw = localStorage.getItem(OPS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as OpsState
      // migrate states persisted by older versions
      if (!Array.isArray(parsed.dismissedAlerts)) parsed.dismissedAlerts = []
      parsed.products = parsed.products.map((p) =>
        p.supplierId ? p : { ...p, supplierId: initialOpsState().products.find((x) => x.sku === p.sku)?.supplierId ?? 'SUP-01' },
      )
      return parsed
    }
  } catch {
    /* corrupted or unavailable storage → fresh state */
  }
  return initialOpsState()
}

export function saveOpsState(state: OpsState) {
  try {
    localStorage.setItem(OPS_KEY, JSON.stringify(state))
  } catch {
    /* storage unavailable — session-only state */
  }
}

export function createPO(state: OpsState, supplierId: string, productSku: string, qty: number): OpsState {
  const product = state.products.find((p) => p.sku === productSku)
  if (!product || qty <= 0) return state
  const id = `PO-${state.nextPoNum}`
  const po: PurchaseOrder = {
    id,
    supplierId,
    productSku,
    qty,
    status: 'pending',
    createdAt: now(),
    total: Math.round(qty * product.unitCost * 100) / 100,
  }
  return {
    ...state,
    nextPoNum: state.nextPoNum + 1,
    orders: [po, ...state.orders],
    events: [{ at: now(), text: `${id} created — ${qty} × ${product.name} ($${po.total.toLocaleString()}) — awaiting approval`, tone: 'info' as const }, ...state.events].slice(0, 30),
  }
}

export function approvePO(state: OpsState, id: string): OpsState {
  return {
    ...state,
    orders: state.orders.map((o) => (o.id === id && o.status === 'pending' ? { ...o, status: 'approved' as const } : o)),
    events: [{ at: now(), text: `${id} approved — released to supplier`, tone: 'ok' as const }, ...state.events].slice(0, 30),
  }
}

/** Receiving updates inventory in the same "transaction" — the blueprint's transactional guarantee. */
export function receivePO(state: OpsState, id: string): OpsState {
  const po = state.orders.find((o) => o.id === id)
  if (!po || po.status !== 'approved') return state
  const product = state.products.find((p) => p.sku === po.productSku)
  const next: OpsState = {
    ...state,
    orders: state.orders.map((o) => (o.id === id ? { ...o, status: 'received' as const } : o)),
    products: state.products.map((p) => (p.sku === po.productSku ? { ...p, stock: p.stock + po.qty } : p)),
    events: [
      { at: now(), text: `${id} received — ${product?.name ?? po.productSku} stock +${po.qty} (inventory updated)`, tone: 'ok' as const },
      ...state.events,
    ].slice(0, 30),
  }
  return { ...next, dismissedAlerts: rearmAlerts(next) }
}

export interface OpsKpis {
  openOrderValue: number
  receivedThisSession: number
  lowStock: number
  pendingApprovals: number
}

export function computeKpis(state: OpsState): OpsKpis {
  return {
    openOrderValue: state.orders.filter((o) => o.status !== 'received').reduce((a, o) => a + o.total, 0),
    receivedThisSession: state.orders.filter((o) => o.status === 'received').length,
    lowStock: state.products.filter((p) => p.stock < p.reorderPoint).length,
    pendingApprovals: state.orders.filter((o) => o.status === 'pending').length,
  }
}

/** Low-stock products whose alert is currently active (not dismissed). */
export function activeAlerts(state: OpsState): Product[] {
  return state.products.filter((p) => p.stock < p.reorderPoint && !state.dismissedAlerts.includes(p.sku))
}

/** Dismiss a low-stock alert. It re-arms automatically if the stock recovers and drops again. */
export function dismissAlert(state: OpsState, sku: string): OpsState {
  if (state.dismissedAlerts.includes(sku)) return state
  return {
    ...state,
    dismissedAlerts: [...state.dismissedAlerts, sku],
    events: [{ at: now(), text: `Low-stock alert for ${sku} acknowledged`, tone: 'warn' as const }, ...state.events].slice(0, 30),
  }
}

/** Open (pending or approved) PO already covering a product, if any. */
export function openPoForProduct(state: OpsState, sku: string): PurchaseOrder | undefined {
  return state.orders.find((o) => o.productSku === sku && o.status !== 'received')
}

/** Quantity that brings stock back to 2× the reorder point — the healthy-zone target. */
export function reorderQty(product: Product): number {
  return Math.max(product.reorderPoint * 2 - product.stock, 1)
}

/**
 * Corrective workflow: a threshold alert turns into an approval-gated reorder PO
 * for the shortfall, with the product's preferred supplier. No-op when an open PO
 * for the product already exists.
 */
export function createReorderPO(state: OpsState, sku: string): OpsState {
  const product = state.products.find((p) => p.sku === sku)
  if (!product || product.stock >= product.reorderPoint) return state
  if (openPoForProduct(state, sku)) return state
  const qty = reorderQty(product)
  const id = `PO-${state.nextPoNum}`
  const po: PurchaseOrder = {
    id,
    supplierId: product.supplierId,
    productSku: sku,
    qty,
    status: 'pending',
    createdAt: now(),
    total: Math.round(qty * product.unitCost * 100) / 100,
  }
  const supplier = state.suppliers.find((s) => s.id === product.supplierId)
  return {
    ...state,
    nextPoNum: state.nextPoNum + 1,
    orders: [po, ...state.orders],
    events: [
      {
        at: now(),
        text: `Corrective action — low-stock alert on ${product.name} auto-created ${id}: ${qty} units from ${supplier?.name ?? product.supplierId} ($${po.total.toLocaleString()}), awaiting approval`,
        tone: 'warn' as const,
      },
      ...state.events,
    ].slice(0, 30),
  }
}

// Re-arm dismissed alerts once stock is back above the reorder point.
function rearmAlerts(state: OpsState): string[] {
  return state.dismissedAlerts.filter((sku) => {
    const p = state.products.find((x) => x.sku === sku)
    return p ? p.stock < p.reorderPoint : false
  })
}
