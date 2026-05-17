import figma from "@figma/code-connect"
import { Tabs } from "@atlas/ui-web/patterns/Tabs/Tabs"

/**
 * Atlas Tabs — Code Connect
 * Figma node: 146:54
 *
 * Figma variant → React variant mapping:
 *   line      → "underline"
 *   pill      → "pills"
 *   segmented → "enclosed"
 */
figma.connect(
  Tabs,
  "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=146-54",
  {
    props: {
      variant: figma.enum("Variant", {
        line:      "underline",
        pill:      "pills",
        segmented: "enclosed",
      }),
      size: figma.enum("Size", {
        sm: "sm",
        md: "md",
        lg: "lg",
      }),
    },
    example: ({ variant, size }) => (
      <Tabs
        variant={variant}
        size={size}
        items={[
          { id: "tab1", label: "Tab 1", content: <p>Content for tab 1</p> },
          { id: "tab2", label: "Tab 2", content: <p>Content for tab 2</p> },
          { id: "tab3", label: "Tab 3", content: <p>Content for tab 3</p> },
        ]}
      />
    ),
  }
)
