import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  approvePO,
  createPO,
  dismissAlert,
  initialOpsState,
  loadOpsState,
  receivePO,
  saveOpsState,
  type OpsState,
} from '@/lib/ops'

interface OpsStore {
  state: OpsState
  createPO: (supplierId: string, productSku: string, qty: number) => void
  approvePO: (id: string) => void
  receivePO: (id: string) => void
  dismissAlert: (sku: string) => void
  resetDemo: () => void
}

const OpsContext = createContext<OpsStore | null>(null)

/** Shared operations state for the Operations and Dashboard sections. */
export function OpsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OpsState>(loadOpsState)

  useEffect(() => saveOpsState(state), [state])

  const store: OpsStore = {
    state,
    createPO: (supplierId, productSku, qty) => setState((s) => createPO(s, supplierId, productSku, qty)),
    approvePO: (id) => setState((s) => approvePO(s, id)),
    receivePO: (id) => setState((s) => receivePO(s, id)),
    dismissAlert: (sku) => setState((s) => dismissAlert(s, sku)),
    resetDemo: () => setState(initialOpsState()),
  }

  return <OpsContext.Provider value={store}>{children}</OpsContext.Provider>
}

export function useOps(): OpsStore {
  const ctx = useContext(OpsContext)
  if (!ctx) throw new Error('useOps must be used inside OpsProvider')
  return ctx
}
