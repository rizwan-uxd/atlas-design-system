import * as React from "react"
import { Alert } from "@atlas/ui-web/compositions/Alert/Alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@atlas/ui-web/compositions/Card/Card"
import { DatePicker, DatePickerContent, DatePickerTrigger, type DatePickerRange } from "@atlas/ui-web/compositions/DatePicker/DatePicker"
import { Chart, ChartContent, ChartDescription, ChartHeader, ChartTitle, ChartBar } from "@atlas/ui-web/compositions/Chart/Chart"
import { Badge } from "@atlas/ui-web/primitives/Badge/Badge"
import { Button } from "@atlas/ui-web/primitives/Button/Button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@atlas/ui-web/primitives/Select/Select"
import { Switch } from "@atlas/ui-web/primitives/Switch/Switch"
import { Skeleton } from "@atlas/ui-web/primitives/Skeleton/Skeleton"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@atlas/ui-web/primitives/Table/Table"

type Kpi = { label: string; value: string; delta: number }
type Row = { page: string; views: number }

const PERIODS: Record<string, string> = { "24h": "Last 24 hours", "7d": "Last 7 days", "30d": "Last 30 days", custom: "Custom range" }

export function UsageDashboard({ kpis, series, pages, loading, error, range, onRange, custom, onCustom, compare, onCompare, onConnect, onRetry }: {
  kpis: Kpi[]
  series: Array<{ date: string; visitors: number }>
  pages: Row[]
  loading: boolean
  error: boolean
  range: string
  onRange: (v: string) => void
  custom: DatePickerRange
  onCustom: (r: DatePickerRange) => void
  compare: boolean
  onCompare: (v: boolean) => void
  onConnect: () => void
  onRetry: () => void
}) {
  // First use: nothing is connected, so there is nothing to filter. One empty state, one next step.
  if (!loading && kpis.length === 0) {
    return (
      <div role="status" style={{ display: "grid", justifyItems: "center", textAlign: "center", gap: "var(--atlas-spacing-3)", paddingBlock: "var(--atlas-spacing-12)" }}>
        <h2 style={{ fontSize: "var(--atlas-text-h3)" }}>No data yet</h2>
        <p style={{ fontSize: "var(--atlas-text-body-sm)", color: "var(--atlas-foreground-muted)" }}>Connect a data source to see visitors, revenue and activity here.</p>
        <Button variant="primary" onClick={onConnect}>Connect a data source</Button>
      </div>
    )
  }
  const periodLabel = PERIODS[range]
  return (
    <div style={{ display: "grid", gap: "var(--atlas-spacing-6)" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--atlas-spacing-3)", alignItems: "center" }}>
        <div style={{ flex: "0 1 12rem" }}>
          <Select value={range} onValueChange={onRange}>
            <SelectTrigger aria-label="Date range"><SelectValue placeholder="Date range" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div style={{ flex: "0 1 15rem" }}>
          <DatePicker mode="range" value={custom} onValueChange={(v) => { onCustom(v); onRange("custom") }}>
            <DatePickerTrigger aria-label="Custom date range" placeholder="Pick a range" />
            <DatePickerContent />
          </DatePicker>
        </div>
        <Switch label="Compare to previous period" checked={compare} onCheckedChange={onCompare} />
        <span style={{ flex: 1 }} />
        {(range !== "7d" || compare) && <Button variant="ghost" onClick={() => { onRange("7d"); onCompare(false) }}>Reset</Button>}
        <Button variant="outline">Export</Button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(var(--atlas-content-width-sm), 1fr))", gap: "var(--atlas-spacing-4)" }}>
        {kpis.map((k) => (
          <Card key={k.label} variant="outlined">
            <CardHeader><CardTitle>{k.label}</CardTitle><CardDescription>{periodLabel}</CardDescription></CardHeader>
            <CardContent>
              {loading ? <Skeleton /> : (
                <>
                  <p style={{ fontSize: "var(--atlas-font-size-2xl)" }}>{k.value}</p>
                  <Badge size="sm" variant={k.delta > 0 ? "success" : k.delta < 0 ? "danger" : "neutral"}>
                    {k.delta > 0 ? "Up " : k.delta < 0 ? "Down " : "Flat "}{Math.abs(k.delta)}% vs previous period
                  </Badge>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart and table share a row on desktop and stack on a phone. The chart keeps its natural width. */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--atlas-spacing-6)", alignItems: "flex-start" }}>
        <div style={{ flex: "0 1 670px", minWidth: 0, inlineSize: "100%", maxInlineSize: "670px" }}>
        {error ? (
          <Alert variant="danger" title="We couldn't load visitors" description="The other cards are unaffected."
            actions={<Button variant="outline" size="sm" onClick={onRetry}>Retry</Button>} />
        ) : (
          <Chart state={loading ? "loading" : series.length === 0 ? "empty" : "default"}>
            <ChartHeader>
              <ChartTitle>Visitors</ChartTitle>
              <ChartDescription>Daily visitors for the selected range</ChartDescription>
            </ChartHeader>
            <ChartContent emptyMessage="No visitors in this range">
              <ChartBar aria-label="Visitors per day" data={series} xKey="date" dataKey="visitors" label="Visitors" />
            </ChartContent>
          </Chart>
        )}
        </div>
        <section aria-labelledby="top-pages" style={{ flex: "1 1 20rem", minWidth: 0, display: "grid", gap: "var(--atlas-spacing-3)" }}>
          <h2 id="top-pages" style={{ fontSize: "var(--atlas-text-h4)" }}>Top pages</h2>
          <div style={{ overflowX: "auto" }}>
            {loading ? <Skeleton /> : (
              <Table>
                <TableCaption>Page views in the selected range</TableCaption>
                <TableHeader>
                  <TableRow><TableHead>Page</TableHead><TableHead align="end">Views</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {pages.map((p) => (
                    <TableRow key={p.page}><TableCell>{p.page}</TableCell><TableCell align="end">{p.views}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
