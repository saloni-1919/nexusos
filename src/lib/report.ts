import { activeAlerts, computeKpis, reorderQty, type OpsState } from '@/lib/ops'

function money(n: number): string {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function row(cells: (string | number)[]): string {
  return `| ${cells.join(' | ')} |`
}

/** Build a dated, print-ready management report (Markdown) from live ops state. */
export function buildReportMarkdown(state: OpsState, generatedAt = new Date()): string {
  const kpis = computeKpis(state)
  const alerts = activeAlerts(state)
  const open = state.orders.filter((o) => o.status !== 'received')
  const date = generatedAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const time = generatedAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  const lines: string[] = [
    `# NexusOS — Management Report`,
    ``,
    `**Generated:** ${date}, ${time}  `,
    `**Scope:** procurement, inventory, threshold alerts (demo workspace)`,
    ``,
    `---`,
    ``,
    `## Key performance indicators`,
    ``,
    row(['Metric', 'Value']),
    row(['---', '---:']),
    row(['Open order value', money(kpis.openOrderValue)]),
    row(['Pending approvals', kpis.pendingApprovals]),
    row(['Low-stock products', kpis.lowStock]),
    row(['POs received (all)', kpis.receivedThisSession]),
    row(['Active threshold alerts', alerts.length]),
    ``,
    `## Inventory position`,
    ``,
    row(['Product', 'SKU', 'In stock', 'Reorder point', 'Status', 'Suggested reorder']),
    row(['---', '---', '---:', '---:', '---', '---:']),
    ...state.products.map((p) => {
      const low = p.stock < p.reorderPoint
      return row([p.name, p.sku, p.stock, p.reorderPoint, low ? '⚠ BELOW THRESHOLD' : 'OK', low ? `${reorderQty(p)} units` : '—'])
    }),
    ``,
    `## Open purchase orders (${open.length})`,
    ``,
  ]

  if (open.length === 0) {
    lines.push(`_No open purchase orders._`, ``)
  } else {
    lines.push(
      row(['PO', 'Product', 'Supplier', 'Qty', 'Total', 'Status', 'Created']),
      row(['---', '---', '---', '---:', '---:', '---', '---']),
      ...open.map((o) => {
        const p = state.products.find((x) => x.sku === o.productSku)
        const s = state.suppliers.find((x) => x.id === o.supplierId)
        return row([o.id, p?.name ?? o.productSku, s?.name ?? o.supplierId, o.qty, money(o.total), o.status.toUpperCase(), o.createdAt])
      }),
      ``,
    )
  }

  lines.push(`## Threshold alerts`, ``)
  if (alerts.length === 0) {
    lines.push(`All products are above their reorder points. No action needed.`, ``)
  } else {
    lines.push(
      ...alerts.map(
        (p) =>
          `- **${p.name}** (${p.sku}) — ${p.stock} in stock vs ${p.reorderPoint} threshold. Suggested corrective action: reorder ${reorderQty(p)} units.`,
      ),
      ``,
    )
  }

  lines.push(
    `## Recent activity`,
    ``,
    ...state.events.slice(0, 12).map((e) => `- \`${e.at}\` ${e.text}`),
    ``,
    `---`,
    ``,
    `_Report generated locally in the browser by the NexusOS demo — no data left the tab._`,
  )

  return lines.join('\n')
}

export function reportFileName(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `nexusos-report-${y}-${m}-${day}.md`
}
