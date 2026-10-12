import { Check, Plus, SearchX, FolderOpen } from "lucide-react"
import { Button } from "@atlas/ui-web/primitives/Button/Button"

type Props =
  | { kind: "first-use"; onCreate: () => void }
  | { kind: "no-results"; query: string; onClear: () => void }
  | { kind: "cleared"; onUndo: () => void }

// Composed locally: Atlas has no EmptyState component (see atlas/state/candidates.json).
export function ProjectsEmpty(props: Props) {
  const first = props.kind === "first-use"
  const Icon = first ? FolderOpen : props.kind === "cleared" ? Check : SearchX
  return (
    <div role="status" style={{ display: "grid", justifyItems: "center", textAlign: "center",
      gap: "var(--atlas-spacing-3)", paddingBlock: "var(--atlas-spacing-12)" }}>
      <Icon aria-hidden="true" color="var(--atlas-foreground-subtle)" />
      <h2 style={{ fontSize: "var(--atlas-text-h3)", color: "var(--atlas-foreground)" }}>
        {props.kind === "first-use" ? "No projects yet" : props.kind === "cleared" ? "Project deleted" : `No results for “${props.query}”`}
      </h2>
      <p style={{ fontSize: "var(--atlas-text-body-sm)", color: "var(--atlas-foreground-muted)" }}>
        {props.kind === "first-use" ? "Projects group your files and tasks in one place."
          : props.kind === "cleared" ? "The last project was removed. Undo to restore it."
          : "Try a different search, or clear it to see every project."}
      </p>
      {props.kind === "first-use"
        ? <Button variant="primary" leadingIcon={<Plus aria-hidden="true" />} onClick={props.onCreate}>New project</Button>
        : props.kind === "cleared"
          ? <Button variant="outline" onClick={props.onUndo}>Undo</Button>
          : <Button variant="outline" onClick={props.onClear}>Clear search</Button>}
    </div>
  )
}
