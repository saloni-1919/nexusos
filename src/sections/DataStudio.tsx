import { useCallback, useMemo, useRef, useState, type DragEvent } from 'react'
import { Upload, FileSpreadsheet, Download, RotateCcw, FlaskConical, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Button } from '@/components/ui/button'
import { SplitText } from '@/components/reactbits/SplitText'
import { Reveal } from '@/components/Reveal'
import { analyzeCsv, exportCleanCsv, sampleCsv, type AnalysisResult } from '@/lib/csvProfile'
import { cn } from '@/lib/utils'

const TYPE_BADGE: Record<string, string> = {
  number: 'text-signal',
  date: 'text-primary',
  boolean: 'text-primary',
  string: 'text-muted-foreground',
}

type Agg = 'sum' | 'avg' | 'count'

export function DataStudio() {
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [dimension, setDimension] = useState('')
  const [measure, setMeasure] = useState('')
  const [agg, setAgg] = useState<Agg>('sum')
  const inputRef = useRef<HTMLInputElement>(null)

  const ingest = useCallback((text: string, name: string) => {
    try {
      const analysis = analyzeCsv(text, name)
      if (analysis.fields.length === 0 || analysis.rows.length === 0) {
        setError('No usable rows found. Make sure the file is a CSV with a header row.')
        setResult(null)
        return
      }
      setError(null)
      setResult(analysis)
      setDimension(
        analysis.profiles.find((p) => p.type === 'string')?.name ??
          analysis.profiles.find((p) => p.type === 'date')?.name ??
          analysis.fields[0],
      )
      setMeasure(
        analysis.profiles.find((p) => p.type === 'number' && !/_?id$/i.test(p.name))?.name ??
          analysis.profiles.find((p) => p.type === 'number')?.name ??
          '',
      )
      setAgg('sum')
    } catch {
      setError('Could not parse this file. Please upload a valid CSV.')
      setResult(null)
    }
  }, [])

  const onFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0]
      if (!file) return
      if (!/\.csv$/i.test(file.name) && file.type !== 'text/csv') {
        setError('Only CSV files are supported in this demo.')
        return
      }
      setError(null)
      const reader = new FileReader()
      reader.onload = () => ingest(String(reader.result ?? ''), file.name)
      reader.onerror = () => setError('Could not read the file.')
      reader.readAsText(file)
    },
    [ingest],
  )

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragging(false)
    onFiles(e.dataTransfer.files)
  }

  const chartData = useMemo(() => {
    if (!result || !dimension) return []
    const quarantined = new Set(result.quarantined.map((q) => q.index - 1))
    const groups = new Map<string, { sum: number; n: number }>()
    result.rows.forEach((row, i) => {
      if (quarantined.has(i)) return
      const key = (row[dimension] ?? '').trim() || '(empty)'
      const g = groups.get(key) ?? { sum: 0, n: 0 }
      const v = measure ? Number((row[measure] ?? '').replace(/[$,]/g, '')) : 0
      if (!Number.isNaN(v)) g.sum += v
      g.n += 1
      groups.set(key, g)
    })
    return Array.from(groups.entries())
      .map(([name, g]) => ({
        name: name.length > 14 ? name.slice(0, 13) + '…' : name,
        value: agg === 'sum' ? Math.round(g.sum * 100) / 100 : agg === 'avg' ? Math.round((g.sum / g.n) * 100) / 100 : g.n,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 12)
  }, [result, dimension, measure, agg])

  const downloadClean = () => {
    if (!result) return
    const blob = new Blob([exportCleanCsv(result)], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = result.fileName.replace(/\.csv$/i, '') + '-clean.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const reset = () => {
    setResult(null)
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <section id="studio" className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
      <div className="mb-12 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="mb-4 flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.22em] text-primary">
            <FlaskConical className="h-4 w-4" aria-hidden="true" />
            Live demo — data preparation studio
          </p>
          <h2 className="max-w-2xl font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl">
            <SplitText text="Drop a CSV." />
            <br />
            <span className="text-muted-foreground">
              <SplitText text="See what we'd flag." delay={0.15} />
            </span>
          </h2>
        </div>
        <p className="max-w-sm text-[15px] leading-relaxed text-muted-foreground">
          A working slice of the platform's data studio, running entirely in your browser.
          Nothing is uploaded — profiling, validation and charting happen locally, and
          quarantined rows are explained, never silently changed.
        </p>
      </div>

      {!result ? (
        <Reveal y={20}>
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={cn(
              'flex min-h-[280px] flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-14 text-center transition-colors duration-200',
              dragging ? 'border-primary bg-primary/5' : 'border-border bg-card/50',
            )}
          >
            <Upload className={cn('mb-5 h-9 w-9 transition-colors', dragging ? 'text-primary' : 'text-muted-foreground')} aria-hidden="true" />
            <p className="font-display text-xl font-bold tracking-tight">
              {dragging ? 'Drop it — we take it from here' : 'Drag & drop a CSV file'}
            </p>
            <p className="mt-2 max-w-md text-[14px] leading-relaxed text-muted-foreground">
              Sales, inventory, purchasing exports — anything with a header row. Your file
              never leaves this browser tab.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Button
                onClick={() => inputRef.current?.click()}
                className="h-11 cursor-pointer rounded-md bg-primary px-6 font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-primary-foreground hover:bg-primary/85"
              >
                Choose CSV file
              </Button>
              <Button
                variant="outline"
                onClick={() => ingest(sampleCsv(), 'sample-orders.csv')}
                className="h-11 cursor-pointer rounded-md border-border bg-transparent px-6 font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-foreground hover:bg-secondary"
              >
                Try sample data
              </Button>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              aria-label="Upload CSV file"
              onChange={(e) => onFiles(e.target.files)}
            />
            {error && (
              <p className="mt-5 flex items-center gap-2 text-[13.5px] text-destructive" role="alert">
                <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                {error}
              </p>
            )}
          </div>
        </Reveal>
      ) : (
        <div className="space-y-4">
          {/* summary bar */}
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 rounded-xl border border-border bg-card px-5 py-4">
            <span className="flex items-center gap-2 font-mono text-[12.5px] text-foreground">
              <FileSpreadsheet className="h-4 w-4 text-primary" aria-hidden="true" />
              {result.fileName}
            </span>
            <span className="font-mono text-[12px] uppercase tracking-[0.08em] text-muted-foreground">
              {result.rows.length.toLocaleString()} rows · {result.fields.length} columns
            </span>
            <span
              className={cn(
                'flex items-center gap-1.5 font-mono text-[12px] uppercase tracking-[0.08em]',
                result.quarantined.length > 0 ? 'text-destructive' : 'text-signal',
              )}
            >
              {result.quarantined.length > 0 ? (
                <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              {result.quarantined.length} quarantined
            </span>
            <span className="font-mono text-[12px] uppercase tracking-[0.08em] text-muted-foreground">
              parsed in {result.parseMs} ms
            </span>
            <div className="ml-auto flex gap-2">
              <Button
                variant="outline"
                onClick={downloadClean}
                className="h-9 cursor-pointer rounded-md border-border bg-transparent px-4 font-mono text-[11px] uppercase tracking-[0.08em] text-foreground hover:bg-secondary"
              >
                <Download className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                Clean CSV
              </Button>
              <Button
                variant="outline"
                onClick={reset}
                className="h-9 cursor-pointer rounded-md border-border bg-transparent px-4 font-mono text-[11px] uppercase tracking-[0.08em] text-foreground hover:bg-secondary"
              >
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                New file
              </Button>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* column profiles */}
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="border-b border-border px-5 py-3.5">
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  Column profiling
                </span>
              </div>
              <div className="max-h-[380px] overflow-auto">
                <table className="w-full text-left">
                  <thead className="sticky top-0 bg-card">
                    <tr className="border-b border-border">
                      {['Column', 'Type', 'Missing', 'Unique', 'Invalid'].map((h) => (
                        <th key={h} className="px-5 py-2.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {result.profiles.map((p) => (
                      <tr key={p.name}>
                        <td className="max-w-[140px] truncate px-5 py-2.5 font-mono text-[12.5px]">{p.name}</td>
                        <td className={cn('px-5 py-2.5 font-mono text-[12px]', TYPE_BADGE[p.type])}>{p.type}</td>
                        <td className={cn('px-5 py-2.5 font-mono text-[12px]', p.missing > 0 ? 'text-primary' : 'text-muted-foreground')}>
                          {p.missing}
                        </td>
                        <td className="px-5 py-2.5 font-mono text-[12px] text-muted-foreground">{p.unique}</td>
                        <td className={cn('px-5 py-2.5 font-mono text-[12px]', p.invalid > 0 ? 'text-destructive' : 'text-muted-foreground')}>
                          {p.invalid}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* quarantine */}
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="border-b border-border px-5 py-3.5">
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  Data quality center — quarantined records
                </span>
              </div>
              <div className="max-h-[380px] overflow-auto">
                {result.quarantined.length === 0 ? (
                  <p className="flex items-center gap-2 px-5 py-6 text-[14px] text-signal">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    No issues detected. Every row passed validation.
                  </p>
                ) : (
                  <ul className="divide-y divide-border">
                    {result.quarantined.slice(0, 50).map((q) => (
                      <li key={q.index} className="px-5 py-3">
                        <p className="font-mono text-[12px] text-destructive">Row {q.index}</p>
                        <ul className="mt-1 space-y-0.5">
                          {q.reasons.map((r) => (
                            <li key={r} className="text-[12.5px] leading-relaxed text-muted-foreground">
                              {r}
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                )}
                {result.quarantined.length > 50 && (
                  <p className="border-t border-border px-5 py-3 font-mono text-[11px] text-muted-foreground">
                    + {result.quarantined.length - 50} more — export the clean CSV to continue.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* chart builder */}
          <div className="rounded-xl border border-border bg-card p-5 md:p-6">
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label htmlFor="ds-dim" className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-muted-foreground">
                  Group by
                </label>
                <select
                  id="ds-dim"
                  value={dimension}
                  onChange={(e) => setDimension(e.target.value)}
                  className="mt-1.5 block h-10 cursor-pointer rounded-md border border-input bg-background px-3 font-mono text-[12.5px] text-foreground"
                >
                  {result.profiles.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="ds-measure" className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-muted-foreground">
                  Measure
                </label>
                <select
                  id="ds-measure"
                  value={measure}
                  onChange={(e) => setMeasure(e.target.value)}
                  className="mt-1.5 block h-10 cursor-pointer rounded-md border border-input bg-background px-3 font-mono text-[12.5px] text-foreground"
                >
                  {result.profiles.filter((p) => p.type === 'number').map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div role="group" aria-label="Aggregation" className="flex overflow-hidden rounded-md border border-input">
                {(['sum', 'avg', 'count'] as const).map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAgg(a)}
                    aria-pressed={agg === a}
                    className={cn(
                      'h-10 cursor-pointer px-4 font-mono text-[11.5px] uppercase tracking-[0.08em] transition-colors',
                      agg === a ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-secondary',
                    )}
                  >
                    {a}
                  </button>
                ))}
              </div>
              <p className="ml-auto hidden font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground md:block">
                Quarantined rows excluded
              </p>
            </div>

            <div className="mt-6 h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 4, left: 8 }}>
                  <CartesianGrid strokeDasharray="3 5" stroke="hsl(220 14% 16%)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: 'hsl(219 12% 62%)', fontSize: 11, fontFamily: 'IBM Plex Mono, monospace' }}
                    stroke="hsl(220 14% 16%)"
                  />
                  <YAxis
                    tick={{ fill: 'hsl(219 12% 62%)', fontSize: 11, fontFamily: 'IBM Plex Mono, monospace' }}
                    stroke="hsl(220 14% 16%)"
                    width={56}
                  />
                  <Tooltip
                    cursor={{ fill: 'hsl(220 16% 14% / 0.5)' }}
                    contentStyle={{
                      background: 'hsl(220 24% 8%)',
                      border: '1px solid hsl(220 14% 16%)',
                      borderRadius: 8,
                      fontFamily: 'IBM Plex Mono, monospace',
                      fontSize: 12,
                    }}
                    labelStyle={{ color: 'hsl(44 22% 92%)' }}
                    itemStyle={{ color: 'hsl(38 84% 56%)' }}
                  />
                  <Bar dataKey="value" name={`${agg} of ${measure || 'rows'}`} fill="hsl(38 84% 56%)" radius={[4, 4, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
