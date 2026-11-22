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
  rows: Record<string, string>[]
  fields: string[]
  profiles: ColumnProfile[]
  quarantined: QuarantinedRow[]
  duplicateCount: number
  parseMs: number
}

const DATE_LIKE = /^(\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\d{4}-\d{2}-\d{2}T)/

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

export function analyzeCsv(text: string, fileName: string): AnalysisResult {
  const t0 = performance.now()
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  })
  const rows = parsed.data
  const fields = parsed.meta.fields ?? []

  // Per-column profiling
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
    const key = fields.map((f) => row[f] ?? '').join('')
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
        // re-validate the value against the column's detected type rule
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
    rows,
    fields,
    profiles,
    quarantined,
    duplicateCount,
    parseMs: Math.round(performance.now() - t0),
  }
}

export function exportCleanCsv(result: AnalysisResult): string {
  const bad = new Set(result.quarantined.map((q) => q.index - 1))
  const clean = result.rows.filter((_, i) => !bad.has(i))
  return Papa.unparse(clean, { columns: result.fields })
}

/** Sample order data with deliberate defects: bad dates, missing values, duplicates. */
export function sampleCsv(): string {
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
  lines[73] = lines[73].replace(/,[^,]+,[^,]+$/, ',,')  // missing quantity + price
  lines[90] = lines[5] // exact duplicate
  lines[105] = lines[20] // exact duplicate

  return lines.join('\n')
}
