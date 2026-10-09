import { Plus, SearchX, FolderOpen } from "lucide-react"
import { Button } from "@atlas/ui-web/primitives/Button/Button"

type Props =
  | { kind: "first-use"; onCreate: () => void }
  | { kind: "no-results"; query: string; onClear: () => void }

// Composed locally: Atlas has no EmptyState component (see atlas/state/candidates.json).
export function ProjectsEmpty(props: Props) {
  const first = props.kind === "first-use"
  const Icon = first ? FolderOpen : SearchX
  return (
    <div role="status" style={{ display: "grid", justifyItems: "center", textAlign: "center",
      gap: "var(--atlas-spacing-3)", paddingBlock: "var(--atlas-spacing-12)" }}>
      <Icon aria-hidden="true" color="var(--atlas-foreground-subtle)" />
      <h2 style={{ fontSize: "var(--atlas-text-h3)", color: "var(--atlas-foreground)" }}>
        {first ? "No projects yet" : `No results for “${props.query}”`}
      </h2>
      <p style={{ fontSize: "var(--atlas-text-body-sm)", color: "var(--atlas-foreground-muted)" }}>
        {first ? "Projects group your files and tasks in one place." : "Try a different search, or clear it to see every project."}
      </p>
      {props.kind === "first-use"
        ? <Button variant="primary" leadingIcon={<Plus aria-hidden="true" />} onClick={props.onCreate}>New project</Button>
        : <Button variant="outline" onClick={props.onClear}>Clear search</Button>}
    </div>
  )
}
