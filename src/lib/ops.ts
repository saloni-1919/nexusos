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
      { sku: 'WDG-A', name: 'Widget A', stock: 34, reorderPoint: 50, unitCost: 42.0 },
      { sku: 'WDG-B', name: 'Widget B', stock: 120, reorderPoint: 60, unitCost: 28.5 },
      { sku: 'GDG-X', name: 'Gadget X', stock: 12, reorderPoint: 40, unitCost: 96.75 },
      { sku: 'CMP-Z', name: 'Component Z', stock: 210, reorderPoint: 80, unitCost: 11.2 },
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
  }
}

export function loadOpsState(): OpsState {
  try {
    const raw = localStorage.getItem(OPS_KEY)
    if (raw) return JSON.parse(raw) as OpsState
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
  return {
    ...state,
    orders: state.orders.map((o) => (o.id === id ? { ...o, status: 'received' as const } : o)),
    products: state.products.map((p) => (p.sku === po.productSku ? { ...p, stock: p.stock + po.qty } : p)),
    events: [
      { at: now(), text: `${id} received — ${product?.name ?? po.productSku} stock +${po.qty} (inventory updated)`, tone: 'ok' as const },
      ...state.events,
    ].slice(0, 30),
  }
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
