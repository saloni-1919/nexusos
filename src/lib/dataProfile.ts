import Papa from 'papaparse'

export type ColumnType = 'number' | 'date' | 'boolean' | 'string'

export interface ColumnProfile {
  name: string
  type: ColumnType
  missing: number
  unique: number
  invalid: number
  min?: number
  max?: number
  mean?: number
}

export interface QuarantinedRow {
  index: number // 1-based data row number (header excluded)
  reasons: string[]
}

export interface AnalysisResult {
  fileName: string
  format: string
  rows: Record<string, string>[]
  fields: string[]
  profiles: ColumnProfile[]
  quarantined: QuarantinedRow[]
  duplicateCount: number
  parseMs: number
}

export const ACCEPTED_EXTENSIONS = ['.csv', '.tsv', '.txt', '.json', '.xlsx', '.xls'] as const
export const ACCEPT_ATTR = '.csv,.tsv,.txt,.json,.xlsx,.xls'

const DATE_LIKE = /^(\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\d{4}-\d{2}-\d{2}T)/

export function detectFormat(name: string): string | null {
  const ext = name.slice(name.lastIndexOf('.')).toLowerCase()
  if (ext === '.csv') return 'CSV'
  if (ext === '.tsv' || ext === '.txt') return 'TSV'
  if (ext === '.json') return 'JSON'
  if (ext === '.xlsx' || ext === '.xls') return 'Excel'
  return null
}

function classify(values: string[]): { type: ColumnType; isValid: (v: string) => boolean } {
  const sample = values.filter((v) => v !== '').slice(0, 500)
  if (sample.length === 0) return { type: 'string', isValid: () => true }

  const numOk = sample.filter((v) => v.trim() !== '' && !Number.isNaN(Number(v.replace(/[$,]/g, '')))).length
  if (numOk / sample.length >= 0.9) {
    return { type: 'number', isValid: (v) => !Number.isNaN(Number(v.replace(/[$,]/g, ''))) }
  }

  const dateOk = sample.filter((v) => DATE_LIKE.test(v.trim()) && !Number.isNaN(Date.parse(v))).length
  if (dateOk / sample.length >= 0.9) {
    return { type: 'date', isValid: (v) => DATE_LIKE.test(v.trim()) && !Number.isNaN(Date.parse(v)) }
  }

  const boolOk = sample.filter((v) => /^(true|false|yes|no|0|1)$/i.test(v.trim())).length
  if (boolOk / sample.length >= 0.95) {
    return { type: 'boolean', isValid: (v) => /^(true|false|yes|no|0|1)$/i.test(v.trim()) }
  }

  return { type: 'string', isValid: () => true }
}

/** Coerce any cell value (from Excel/JSON) into the string form the profiler works on. */
function cell(v: unknown): string {
  if (v === null || v === undefined) return ''
  if (v instanceof Date) return v.toISOString().slice(0, 10)
  if (typeof v === 'object') return JSON.stringify(v)
  return String(v)
}

/** Normalize an arbitrary array of objects into rows + fields. */
function normalizeRecords(records: unknown[]): { rows: Record<string, string>[]; fields: string[] } {
  const fields: string[] = []
  const seen = new Set<string>()
  const raw = records.filter((r): r is Record<string, unknown> => r !== null && typeof r === 'object' && !Array.isArray(r))
  raw.forEach((r) => {
    Object.keys(r).forEach((k) => {
      const key = k.trim()
      if (key && !seen.has(key)) {
        seen.add(key)
        fields.push(key)
      }
    })
  })
  const rows = raw.map((r) => {
    const row: Record<string, string> = {}
    fields.forEach((f) => {
      row[f] = cell(r[f])
    })
    return row
  })
  return { rows, fields }
}

/** Extract the first usable array of objects from arbitrary JSON. */
function extractJsonRecords(parsed: unknown): unknown[] {
  if (Array.isArray(parsed)) return parsed
  if (parsed !== null && typeof parsed === 'object') {
    // common envelopes: { data: [...] }, { rows: [...] }, { records: [...] }, { items: [...] }
    for (const key of ['data', 'rows', 'records', 'items', 'results']) {
      const v = (parsed as Record<string, unknown>)[key]
      if (Array.isArray(v)) return v
    }
    // otherwise: first array-valued property
    for (const v of Object.values(parsed as Record<string, unknown>)) {
      if (Array.isArray(v) && v.length > 0) return v
    }
    // a single flat object → treat as one record
    return [parsed]
  }
  return []
}

/** Core profiling + quarantine engine. Domain-agnostic: works on any columns. */
export function analyzeRows(rows: Record<string, string>[], fields: string[], fileName: string, format: string, t0: number): AnalysisResult {
  const profiles: ColumnProfile[] = fields.map((name) => {
    const values = rows.map((r) => (r[name] ?? '').trim())
    const missing = values.filter((v) => v === '').length
    const unique = new Set(values.filter((v) => v !== '')).size
    const { type, isValid } = classify(values)
    const invalid = values.filter((v) => v !== '' && !isValid(v)).length

    const profile: ColumnProfile = { name, type, missing, unique, invalid }
    if (type === 'number') {
      const nums = values.filter((v) => v !== '' && isValid(v)).map((v) => Number(v.replace(/[$,]/g, '')))
      if (nums.length > 0) {
        profile.min = Math.min(...nums)
        profile.max = Math.max(...nums)
        profile.mean = nums.reduce((a, b) => a + b, 0) / nums.length
      }
    }
    return profile
  })

  // Quarantine: exact duplicates + rows containing invalid typed values
  const seen = new Map<string, number>()
  const quarantineMap = new Map<number, Set<string>>()
  let duplicateCount = 0

  rows.forEach((row, i) => {
    const key = fields.map((f) => row[f] ?? '').join(' ')
    if (seen.has(key)) {
      duplicateCount++
      const set = quarantineMap.get(i) ?? new Set<string>()
      set.add(`Exact duplicate of row ${(seen.get(key) ?? 0) + 1}`)
      quarantineMap.set(i, set)
    } else {
      seen.set(key, i)
    }
  })

  rows.forEach((row, i) => {
    profiles.forEach((p) => {
      const v = (row[p.name] ?? '').trim()
      if (v !== '' && p.invalid > 0) {
        const typeRule =
          p.type === 'number'
            ? !Number.isNaN(Number(v.replace(/[$,]/g, '')))
            : p.type === 'date'
              ? DATE_LIKE.test(v) && !Number.isNaN(Date.parse(v))
              : p.type === 'boolean'
                ? /^(true|false|yes|no|0|1)$/i.test(v)
                : true
        if (!typeRule) {
          const set = quarantineMap.get(i) ?? new Set<string>()
          set.add(`Invalid ${p.type} in "${p.name}": "${v.length > 24 ? v.slice(0, 24) + '…' : v}"`)
          quarantineMap.set(i, set)
        }
      }
    })
  })

  const quarantined: QuarantinedRow[] = Array.from(quarantineMap.entries())
    .map(([index, reasons]) => ({ index: index + 1, reasons: Array.from(reasons) }))
    .sort((a, b) => a.index - b.index)

  return {
    fileName,
    format,
    rows,
    fields,
    profiles,
    quarantined,
    duplicateCount,
    parseMs: Math.round(performance.now() - t0),
  }
}

/** Parse delimited text (CSV / TSV / pasted exports). Delimiter is auto-detected. */
export function analyzeDelimitedText(text: string, fileName: string, format: string): AnalysisResult {
  const t0 = performance.now()
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  })
  return analyzeRows(parsed.data, parsed.meta.fields ?? [], fileName, format, t0)
}

/** Parse JSON text: array of objects, common envelopes, or a single flat object. */
export function analyzeJsonText(text: string, fileName: string): AnalysisResult {
  const t0 = performance.now()
  const parsed: unknown = JSON.parse(text)
  const { rows, fields } = normalizeRecords(extractJsonRecords(parsed))
  return analyzeRows(rows, fields, fileName, 'JSON', t0)
}

/** Parse an Excel workbook (first non-empty sheet). SheetJS is lazy-loaded on demand. */
export async function analyzeExcelFile(file: File): Promise<AnalysisResult> {
  const t0 = performance.now()
  const XLSX = await import('xlsx')
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true })
  const sheetName =
    workbook.SheetNames.find((n) => {
      const sheet = workbook.Sheets[n]
      return sheet && Object.keys(sheet).some((k) => !k.startsWith('!'))
    }) ?? workbook.SheetNames[0]
  if (!sheetName) throw new Error('Workbook has no sheets')
  const records = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[sheetName], { defval: '' })
  const { rows, fields } = normalizeRecords(records)
  return analyzeRows(rows, fields, file.name, `Excel · ${sheetName}`, t0)
}

/** Sniff text content when the extension is ambiguous. */
export function analyzeText(text: string, fileName: string, format: string): AnalysisResult {
  const trimmed = text.trimStart()
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      return analyzeJsonText(text, fileName)
    } catch {
      // not valid JSON after all — fall through to delimited parsing
    }
  }
  return analyzeDelimitedText(text, fileName, format)
}

export function exportCleanCsv(result: AnalysisResult): string {
  const bad = new Set(result.quarantined.map((q) => q.index - 1))
  const clean = result.rows.filter((_, i) => !bad.has(i))
  return Papa.unparse(clean, { columns: result.fields })
}

export interface SampleDataset {
  id: string
  label: string
  fileName: string
  format: string
  load: () => AnalysisResult
}

/** Sample datasets from different domains and formats, each with a few realistic defects. */
export const SAMPLE_DATASETS: SampleDataset[] = [
  {
    id: 'sales',
    label: 'Sales',
    fileName: 'sample-sales.csv',
    format: 'CSV',
    load: () => analyzeDelimitedText(sampleSalesCsv(), 'sample-sales.csv', 'CSV'),
  },
  {
    id: 'people',
    label: 'People / HR',
    fileName: 'sample-people.json',
    format: 'JSON',
    load: () => analyzeJsonText(samplePeopleJson(), 'sample-people.json'),
  },
  {
    id: 'marketing',
    label: 'Marketing',
    fileName: 'sample-campaigns.csv',
    format: 'CSV',
    load: () => analyzeDelimitedText(sampleCampaignsCsv(), 'sample-campaigns.csv', 'CSV'),
  },
]

function sampleSalesCsv(): string {
  const customers = ['Acme Corp', 'BlueRiver Ltd', 'Cascade Co', 'Delta Traders', 'Everline Inc', 'Foxglove GmbH']
  const regions = ['North', 'South', 'East', 'West']
  const products = ['Widget A', 'Widget B', 'Gadget X', 'Gadget Y', 'Component Z']
  const lines: string[] = ['order_id,order_date,customer,region,product,quantity,unit_price']

  let id = 1000
  for (let m = 0; m < 6; m++) {
    for (let i = 0; i < 20; i++) {
      const day = String(1 + ((i * 7 + m * 3) % 27)).padStart(2, '0')
      const month = String(6 + m).padStart(2, '0')
      const date = `2026-${month}-${day}`
      const customer = customers[(i + m) % customers.length]
      const region = regions[(i * 2 + m) % regions.length]
      const product = products[(i + m * 2) % products.length]
      const qty = 5 + ((i * 13 + m * 7) % 60)
      const price = (19.5 + ((i * 3 + m) % 40) * 2.25).toFixed(2)
      lines.push(`${++id},${date},${customer},${region},${product},${qty},${price}`)
    }
  }

  // Inject realistic defects
  lines[12] = lines[12].replace('2026-06-', 'not-a-date')
  lines[37] = lines[37].replace('2026-07-', '2026-13-')
  lines[58] = lines[58].replace(/,[^,]+$/, ',abc') // invalid unit_price
  lines[73] = lines[73].replace(/,[^,]+,[^,]+$/, ',,') // missing quantity + price
  lines[90] = lines[5] // exact duplicate
  lines[105] = lines[20] // exact duplicate

  return lines.join('\n')
}

function samplePeopleJson(): string {
  const departments = ['Engineering', 'Sales', 'Operations', 'Finance', 'Design']
  const locations = ['New York', 'Austin', 'Berlin', 'Remote']
  const first = ['Ava', 'Liam', 'Maya', 'Noah', 'Zoe', 'Ethan', 'Ivy', 'Owen', 'Nora', 'Lucas']
  const last = ['Hayes', 'Bennett', 'Cole', 'Diaz', 'Ellis', 'Frost', 'Grant', 'Holt']
  const people: Record<string, unknown>[] = []

  for (let i = 0; i < 96; i++) {
    const name = `${first[i % first.length]} ${last[(i * 3) % last.length]}`
    people.push({
      employee_id: `E-${1200 + i}`,
      name,
      department: departments[(i * 2) % departments.length],
      location: locations[(i * 5 + Math.floor(i / 8)) % locations.length],
      start_date: `20${18 + (i % 7)}-${String(1 + (i % 12)).padStart(2, '0')}-${String(1 + ((i * 11) % 27)).padStart(2, '0')}`,
      salary: 62000 + ((i * 4300) % 78000),
      active: i % 9 !== 0,
    })
  }

  // Inject realistic defects
  ;(people[14] as Record<string, unknown>).start_date = 'next Tuesday'
  ;(people[41] as Record<string, unknown>).salary = 'unknown'
  delete (people[63] as Record<string, unknown>).department
  people[77] = { ...people[3] } // exact duplicate
  people[88] = { ...people[3] } // exact duplicate again

  return JSON.stringify(people, null, 2)
}

function sampleCampaignsCsv(): string {
  const channels = ['Search', 'Social', 'Email', 'Display', 'Video']
  const campaigns = ['Spring Launch', 'Retargeting Q3', 'Brand Awareness', 'Holiday Push', 'Webinar Series', 'Referral Boost']
  const lines: string[] = ['campaign,channel,week_start,impressions,clicks,spend_usd,conversions']

  for (let w = 0; w < 16; w++) {
    for (let c = 0; c < campaigns.length; c++) {
      if ((w + c) % 5 === 4) continue // some campaigns skip weeks
      const date = `2026-${String(7 + Math.floor(w / 4)).padStart(2, '0')}-${String(1 + (w % 4) * 7).padStart(2, '0')}`
      const channel = channels[(c + w) % channels.length]
      const impressions = 8000 + ((w * 3733 + c * 911) % 60000)
      const clicks = Math.round(impressions * (0.012 + ((c + w) % 5) * 0.004))
      const spend = (clicks * (0.8 + ((c * 3 + w) % 7) * 0.35)).toFixed(2)
      const conversions = Math.round(clicks * (0.03 + (c % 4) * 0.015))
      lines.push(`${campaigns[c]},${channel},${date},${impressions},${clicks},${spend},${conversions}`)
    }
  }

  // Inject realistic defects
  lines[9] = lines[9].replace(/,\d+$/, ',oops') // invalid conversions
  lines[22] = lines[22].replace(/\d{4}-\d{2}-\d{2}/, '2026-13-08') // invalid date
  lines[44] = lines[44].replace(/,\d+,\d+\.\d\d,/, ',,,') // missing clicks + spend
  lines[60] = lines[12] // exact duplicate

  return lines.join('\n')
}
