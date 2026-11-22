export const NAV_LINKS = [
  { label: 'Platform', hash: '#platform' },
  { label: 'The Loop', hash: '#loop' },
  { label: 'Engine', hash: '#engine' },
  { label: 'Studio', hash: '#studio' },
  { label: 'Operations', hash: '#operations' },
  { label: 'Automation', hash: '#automation' },
  { label: 'Flaws', hash: '#flaws' },
  { label: 'Roadmap', hash: '#roadmap' },
] as const

export const MODULES = [
  'Core ERP',
  'Data Integration',
  'Data Preparation',
  'Analytics Engine',
  'Visualization Studio',
  'KPI & Reporting',
  'Workflow Automation',
  'AI Intelligence',
  'Predictive Analytics',
  'Collaboration',
  'Security & Governance',
  'Administration',
] as const

export const PILLARS = [
  {
    icon: 'Boxes',
    title: 'ERP System',
    tag: 'Operate',
    copy: 'Manage customers, orders, inventory, purchasing and approvals where the work actually happens — not in exported spreadsheets.',
  },
  {
    icon: 'BarChart3',
    title: 'Business Intelligence',
    tag: 'Understand',
    copy: 'Dashboards and scorecards built on a governed semantic layer, so "revenue" means the same thing to sales and finance.',
  },
  {
    icon: 'Workflow',
    title: 'Workflow Automation',
    tag: 'Act',
    copy: 'Triggers, approvals and scheduled jobs with idempotent retries — automation that can never duplicate a purchase order.',
  },
  {
    icon: 'BrainCircuit',
    title: 'AI Decision Support',
    tag: 'Recommend',
    copy: 'AI explains trends grounded in the metric engine. It never invents KPIs and never touches money without approval.',
  },
  {
    icon: 'Plug',
    title: 'Data Integration',
    tag: 'Connect',
    copy: 'CSV, Excel, SQL databases, REST APIs and your existing ERP — every import validated, logged and reversible.',
  },
  {
    icon: 'ShieldCheck',
    title: 'Security & Governance',
    tag: 'Protect',
    copy: 'Tenant isolation, role-based access, tamper-resistant audit logs and tested recovery — designed in, not bolted on.',
  },
] as const

export const LOOP_STEPS = [
  {
    id: 'operate',
    num: '01',
    title: 'Operate',
    headline: 'Business actions create data.',
    copy: 'A sale is recorded once — and the order, inventory and financial records update together, transactionally. If one write fails, nothing is left half-done.',
    detail: 'Sales orders · Stock movements · Invoices',
  },
  {
    id: 'data',
    num: '02',
    title: 'Data',
    headline: 'Data is validated before it is trusted.',
    copy: 'Imports are profiled, cleaned and reconciled. Upload 100,000 rows and the 2,500 with invalid dates are shown, quarantined and explained — never silently changed.',
    detail: 'Validation · Lineage · Version history',
  },
  {
    id: 'insight',
    num: '03',
    title: 'Insight',
    headline: 'Data becomes governed insight.',
    copy: 'Every KPI resolves to one versioned definition in the metric registry — formula, owner, source, refresh cadence. A wrong number is treated as an incident, not a rounding error.',
    detail: 'Semantic layer · Drill-through · Freshness',
  },
  {
    id: 'action',
    num: '04',
    title: 'Action',
    headline: 'Insights trigger controlled actions.',
    copy: 'Open the ERP record straight from the chart, assign an owner, launch an approval-gated workflow. The loop closes — and the action becomes new operational data.',
    detail: 'Approvals · Idempotent retries · Audit trail',
  },
] as const

export const ANALYTICS_LEVELS = [
  {
    num: '01',
    name: 'Descriptive',
    question: 'What happened?',
    example: 'Revenue increased 12% this quarter.',
  },
  {
    num: '02',
    name: 'Diagnostic',
    question: 'Why did it happen?',
    example: 'Growth came from three products and two regions.',
  },
  {
    num: '03',
    name: 'Predictive',
    question: 'What is likely to happen?',
    example: 'Demand may exceed available stock next month.',
  },
  {
    num: '04',
    name: 'Prescriptive',
    question: 'What should we do?',
    example: 'Recommend a reorder, with projected cost and approval.',
  },
] as const

export const KPI_REGISTRY = [
  { attr: 'KPI name', value: 'Gross Profit Margin' },
  { attr: 'Definition', value: 'Gross profit divided by net revenue' },
  { attr: 'Formula', value: '(Net Revenue − COGS) / Net Revenue × 100' },
  { attr: 'Currency', value: 'USD' },
  { attr: 'Time grain', value: 'Monthly' },
  { attr: 'Owner', value: 'Finance Department' },
  { attr: 'Source', value: 'Invoices, returns, cost records' },
  { attr: 'Refresh', value: 'Every 30 minutes' },
  { attr: 'Version', value: '1.0' },
  { attr: 'Validation', value: 'Reconciled against approved financial totals' },
] as const

export interface ScorecardKpi {
  id: string
  label: string
  value: number
  decimals: number
  prefix: string
  suffix: string
  note: string
  tone: 'good' | 'warn' | 'bad'
  definition: { formula: string; owner: string; source: string; refresh: string }
}

export const SCORECARD_KPIS: ScorecardKpi[] = [
  {
    id: 'revenue',
    label: 'Revenue',
    value: 248500,
    decimals: 0,
    prefix: '$',
    suffix: '',
    note: '+12.4% vs prior period',
    tone: 'good',
    definition: {
      formula: 'Σ invoiced sales − returns (recognized, monthly)',
      owner: 'Finance Department',
      source: 'Invoices · Returns',
      refresh: 'Every 30 minutes',
    },
  },
  {
    id: 'margin',
    label: 'Gross Margin',
    value: 31.6,
    decimals: 1,
    prefix: '',
    suffix: '%',
    note: 'Target: 35%',
    tone: 'warn',
    definition: {
      formula: '(Net Revenue − COGS) / Net Revenue × 100',
      owner: 'Finance Department',
      source: 'Invoices · Cost records',
      refresh: 'Every 30 minutes',
    },
  },
  {
    id: 'delivery',
    label: 'On-time Delivery',
    value: 94.2,
    decimals: 1,
    prefix: '',
    suffix: '%',
    note: 'Target: 97%',
    tone: 'warn',
    definition: {
      formula: 'On-time shipments / total shipments × 100',
      owner: 'Operations',
      source: 'Shipments · Delivery events',
      refresh: 'Hourly',
    },
  },
  {
    id: 'approvals',
    label: 'Overdue Approvals',
    value: 18,
    decimals: 0,
    prefix: '',
    suffix: '',
    note: 'Requires attention',
    tone: 'bad',
    definition: {
      formula: 'Count of approvals past their SLA deadline',
      owner: 'Operations',
      source: 'Approval engine',
      refresh: 'Real-time',
    },
  },
]

/** Illustrative monthly revenue, $ thousands — matches the blueprint scorecard. */
export const REVENUE_SERIES = [
  { month: 'Jun', value: 178 },
  { month: 'Jul', value: 186 },
  { month: 'Aug', value: 204 },
  { month: 'Sep', value: 199 },
  { month: 'Oct', value: 224 },
  { month: 'Nov', value: 248.5 },
] as const

export const WORKFLOW_STEPS = [
  {
    title: 'ERP event',
    copy: 'Inventory falls below the reorder threshold.',
    badge: 'Trigger engine',
  },
  {
    title: 'Rule evaluation',
    copy: 'Demand, available stock and outstanding orders are checked.',
    badge: 'Condition builder',
  },
  {
    title: 'Purchase request',
    copy: 'A proposal is generated and routed for authorization.',
    badge: 'Idempotent — retries never duplicate',
  },
  {
    title: 'Approval & execution',
    copy: 'An authorized manager approves; the system creates the purchase order.',
    badge: 'Human approval gate',
  },
  {
    title: 'Analytics update',
    copy: 'Purchasing and inventory KPIs refresh with the new state.',
    badge: 'Durable execution · audit logged',
  },
] as const

export const FLAWS = [
  {
    title: 'Trying to replace every ERP at once',
    risk: 'A manufacturer, a retailer and a consultancy need completely different business rules. A universal system spends years on edge cases before it is sellable.',
    fix: 'NexusOS launches with one industry — distribution and inventory-led operations — on an architecture built to expand later.',
  },
  {
    title: 'Beautiful dashboards, unreliable numbers',
    risk: 'Charts are easy. Financially accurate figures are not. A wrong KPI is more dangerous than no dashboard at all.',
    fix: 'A governed semantic layer defines every metric once — versioned, owned, reconciled against source records. Animation never outranks accuracy.',
  },
  {
    title: 'Automation without consequences engineering',
    risk: 'An automated order can have downstream financial effects; a retry can create it twice.',
    fix: 'Idempotency keys, durable workflow state, approval gates for irreversible actions, dead-letter queues and a full execution history.',
  },
  {
    title: 'Assuming integration fixes bad data',
    risk: 'Connecting a messy ERP does not fix duplicate customers or inconsistent product codes.',
    fix: 'Onboarding ships with profiling, validation queues, reconciliation and migration tooling — bad records are surfaced, never silently patched.',
  },
  {
    title: 'Building before knowing who pays',
    risk: 'A technically impressive platform fails if switching costs exceed the visible benefit.',
    fix: 'Pilot customers first. Success is measured in hours saved, errors removed and approvals accelerated — not features shipped.',
  },
] as const

export const ROADMAP = [
  {
    phase: 'Phase 0',
    name: 'Discovery & definition',
    duration: '4–6 weeks',
    work: 'Interview users, map workflows, analyze competitors, define MVP scope.',
    exit: 'Clear target customer, validated problem',
  },
  {
    phase: 'Phase 1',
    name: 'Core ERP & foundation',
    duration: '2–3 months',
    work: 'Auth, roles, suppliers, customers, purchasing, inventory transactions, audit logs.',
    exit: 'Reliable end-to-end operational transactions',
  },
  {
    phase: 'Phase 2',
    name: 'Data & analytics foundation',
    duration: '2–3 months',
    work: 'CSV/Excel import, validation, data modeling, governed KPIs, first dashboards.',
    exit: 'KPI reports reconciled against real ERP records',
  },
  {
    phase: 'Phase 3',
    name: 'Visualization & automation',
    duration: '2–3 months',
    work: 'Dashboard builder, event triggers, approval flows, job monitoring, safe retries.',
    exit: 'One complete ERP → insight → action workflow',
  },
  {
    phase: 'Phase 4',
    name: 'Pilot hardening',
    duration: '2–4 months',
    work: 'Security testing, tenant isolation, backup drills, migration tools, pilot onboarding.',
    exit: 'Real users complete real business processes',
  },
  {
    phase: 'Phase 5',
    name: 'Intelligence & expansion',
    duration: 'After pilot',
    work: 'AI querying, anomaly detection, forecasting, more integrations and ERP modules.',
    exit: 'Expansion justified by usage and retention',
  },
] as const

export const SCORES = [
  { label: 'Technical feasibility', score: 9, note: 'Achievable with established architectures' },
  { label: 'Long-term market opportunity', score: 8, note: 'Recurring operational and reporting needs' },
  { label: 'Ease of building', score: 2, note: 'ERP + BI + automation integration is hard' },
  { label: 'Ease of competing', score: 3, note: 'Strong incumbents, high switching costs' },
  { label: 'Potential for differentiation', score: 8, note: 'Focused workflows, measurable outcomes' },
] as const

export const PILOT_STEPS = [
  'Create a supplier and purchase order in the ERP',
  'Track approval, delivery and receiving',
  'Inventory updates automatically on receipt',
  'Analyze purchasing costs, delays and stock levels',
  'See it all on an interactive dashboard',
  'Get alerted when a KPI crosses its threshold',
  'Launch an approval-controlled corrective workflow',
  'Send a scheduled management report',
] as const
