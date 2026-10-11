import * as React from "react"
import { Search } from "lucide-react"
import { Alert } from "@atlas/ui-web/compositions/Alert/Alert"
import { ListItem, ListItemContent, ListItemDescription, ListItemTitle } from "@atlas/ui-web/compositions/ListItem/ListItem"
import { TabsList, TabsRoot, TabsTrigger } from "@atlas/ui-web/patterns/Tabs/Tabs"
import { Badge } from "@atlas/ui-web/primitives/Badge/Badge"
import { Button } from "@atlas/ui-web/primitives/Button/Button"
import { Input } from "@atlas/ui-web/primitives/Input/Input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@atlas/ui-web/primitives/Select/Select"
import { Skeleton } from "@atlas/ui-web/primitives/Skeleton/Skeleton"

type Result = { id: string; title: string; context: string; type: string }

export function SearchResults({ results, loading, error, onSearch, onRetry }: {
  results: Result[]
  loading: boolean
  error: boolean
  onSearch: (q: string, scope: string, sort: string, filters: string[]) => void
  onRetry: () => void
}) {
  const [query, setQuery] = React.useState("")
  const [scope, setScope] = React.useState("all")
  const [sort, setSort] = React.useState("relevance")
  const [filters, setFilters] = React.useState<string[]>([])
  const run = (q = query, s = scope, so = sort, f = filters) => onSearch(q, s, so, f)

  return (
    <div style={{ display: "grid", gap: "var(--atlas-spacing-4)" }}>
      <form role="search" onSubmit={(e) => { e.preventDefault(); run() }}>
        <Input aria-label="Search" type="search" leadingIcon={<Search aria-hidden size={16} />}
          value={query} onChange={(e) => setQuery(e.target.value)} />
      </form>

      <TabsRoot variant="line" value={scope} onValueChange={(v) => { setScope(v); run(query, v) }}>
        <TabsList aria-label="Search scope">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="people">People</TabsTrigger>
        </TabsList>
      </TabsRoot>

      <div style={{ display: "flex", gap: "var(--atlas-spacing-3)", alignItems: "center", justifyContent: "space-between" }}>
        <span aria-live="polite" style={{ whiteSpace: "nowrap" }}>{loading ? "Searching…" : `${results.length} results`}</span>
        <Select value={sort} onValueChange={(v) => { setSort(v); run(query, scope, v) }}>
          <SelectTrigger aria-label="Sort by"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Relevance</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filters.length > 0 && (
        <div style={{ display: "flex", gap: "var(--atlas-spacing-2)", flexWrap: "wrap", alignItems: "center" }}>
          {filters.map((f) => (
            <Badge key={f} variant="neutral" removable removeLabel={`Remove filter ${f}`}
              onRemove={() => { const next = filters.filter((x) => x !== f); setFilters(next); run(query, scope, sort, next) }}>
              {f}
            </Badge>
          ))}
          <Button variant="ghost" onClick={() => { setFilters([]); run(query, scope, sort, []) }}>Clear all</Button>
        </div>
      )}

      {error ? (
        <Alert variant="danger" title="Search failed" description="Your query and filters are kept."
          actions={<Button variant="outline" size="sm" onClick={onRetry}>Retry</Button>} />
      ) : loading ? (
        <div style={{ display: "grid", gap: "var(--atlas-spacing-2)" }}><Skeleton /><Skeleton /><Skeleton /></div>
      ) : results.length === 0 ? (
        <div style={{ display: "grid", gap: "var(--atlas-spacing-3)" }}>
          <p>No results for “{query}”.</p>
          <p style={{ color: "var(--atlas-foreground-muted)" }}>Check the spelling or remove a filter.</p>
          {filters.length > 0 && <Button variant="outline" onClick={() => { setFilters([]); run(query, scope, sort, []) }}>Clear filters</Button>}
        </div>
      ) : (
        <ul style={{ display: "grid", gap: "var(--atlas-spacing-2)", listStyle: "none", padding: 0 }}>
          {results.map((r) => (
            <ListItem key={r.id} as="li">
              <ListItemContent>
                <ListItemTitle>{r.title}</ListItemTitle>
                <ListItemDescription>{r.context}</ListItemDescription>
              </ListItemContent>
            </ListItem>
          ))}
        </ul>
      )}
    </div>
  )
}
