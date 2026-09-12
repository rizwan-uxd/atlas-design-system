import Link from "next/link"
import { flows } from "./_shared/flowRegistry"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@atlas/ui-web/compositions/Card/Card"
import { Badge } from "@atlas/ui-web/primitives/Badge/Badge"

export default function PrototypesIndex() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--atlas-background)",
        color: "var(--atlas-foreground)",
        fontFamily: "var(--atlas-font-sans)",
      }}
    >
      <div
        style={{
          maxWidth: 880,
          margin: "0 auto",
          padding: "var(--atlas-spacing-12) var(--atlas-spacing-6)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--atlas-spacing-8)",
        }}
      >
        <div>
          <Link
            href="/"
            style={{
              fontSize: "var(--atlas-font-size-sm)",
              color: "var(--atlas-foreground-muted)",
              textDecoration: "none",
            }}
          >
            ← Sandbox
          </Link>
          <h1
            style={{
              margin: "var(--atlas-spacing-3) 0 var(--atlas-spacing-2)",
              fontSize: "var(--atlas-font-size-3xl)",
              fontWeight: 700,
            }}
          >
            Prototype flows
          </h1>
          <p
            style={{
              margin: 0,
              color: "var(--atlas-foreground-muted)",
              fontSize: "var(--atlas-font-size-base)",
              maxWidth: 640,
            }}
          >
            Interactive flows built from Atlas components. Each flow is a small,
            self-contained app under <code>app/prototypes/&lt;slug&gt;</code>.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "var(--atlas-spacing-4)",
          }}
        >
          {flows.map((flow) => (
            <Link
              key={flow.slug}
              href={`/prototypes/${flow.slug}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <Card interactive variant="elevated">
                <CardHeader>
                  <CardTitle>{flow.name}</CardTitle>
                  <CardDescription>{flow.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "var(--atlas-spacing-1_5)",
                    }}
                  >
                    {flow.exercises.map((c) => (
                      <Badge key={c} size="sm" variant="secondary">
                        {c}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                {flow.status && (
                  <CardFooter>
                    <Badge
                      size="sm"
                      variant={
                        flow.status === "stable"
                          ? "success"
                          : flow.status === "experimental"
                          ? "warning"
                          : "info"
                      }
                      dot
                    >
                      {flow.status}
                    </Badge>
                  </CardFooter>
                )}
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
