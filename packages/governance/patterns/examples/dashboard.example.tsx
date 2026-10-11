import * as React from "react"
import { Alert } from "@atlas/ui-web/compositions/Alert/Alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@atlas/ui-web/compositions/Card/Card"
import { Chart, ChartContent, ChartDescription, ChartHeader, ChartTitle, ChartBar } from "@atlas/ui-web/compositions/Chart/Chart"
import { Badge } from "@atlas/ui-web/primitives/Badge/Badge"
import { Button } from "@atlas/ui-web/primitives/Button/Button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@atlas/ui-web/primitives/Select/Select"
import { Skeleton } from "@atlas/ui-web/primitives/Skeleton/Skeleton"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@atlas/ui-web/primitives/Table/Table"

type Kpi = { label: string; value: string; delta: number }
type Row = { page: string; views: number }

export function UsageDashboard({ kpis, series, pages, loading, error, range, onRange, onRetry }: {
  kpis: Kpi[]
  series: Array<{ date: string; visitors: number }>
  pages: Row[]
  loading: boolean
  error: boolean
  range: string
  onRange: (v: string) => void
  onRetry: () => void
}) {
  return (
    <div style={{ display: "grid", gap: "var(--atlas-spacing-6)" }}>
      <div style={{ display: "flex", gap: "var(--atlas-spacing-3)", alignItems: "center" }}>
        <Select value={range} onValueChange={onRange}>
          <SelectTrigger aria-label="Date range"><SelectValue placeholder="Date range" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 hours</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
          </SelectContent>
        </Select>
        {range !== "7d" && <Button variant="ghost" onClick={() => onRange("7d")}>Reset</Button>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(var(--atlas-content-width-sm), 1fr))", gap: "var(--atlas-spacing-4)" }}>
        {kpis.map((k) => (
          <Card key={k.label} variant="outlined">
            <CardHeader><CardDescription>{k.label}</CardDescription></CardHeader>
            <CardContent>
              {loading ? <Skeleton /> : (
                <>
                  <p style={{ fontSize: "var(--atlas-font-size-2xl)" }}>{k.value}</p>
                  <Badge variant={k.delta > 0 ? "success" : k.delta < 0 ? "danger" : "neutral"}>
                    {k.delta > 0 ? "Up " : k.delta < 0 ? "Down " : "Flat "}{Math.abs(k.delta)}% vs previous period
                  </Badge>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

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

      <Card variant="outlined">
        <CardHeader><CardTitle>Top pages</CardTitle></CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  )
}
