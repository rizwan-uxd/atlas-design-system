import figma from "@figma/code-connect"
import { Tabs } from "@atlas/ui-web/patterns/Tabs/Tabs"

/**
 * Atlas Tabs — Code Connect
 * Figma node: 146:54
 *
 * Figma variant names now match React exactly (line | pill | segmented | outline).
 * Icon/Badge are per-trigger booleans on the Figma node (a single tab item);
 * demoed here on the first item of the representative Tabs shell.
 * orientation is a code-only prop — no Figma property (see the Examples —
 * Vertical frame on the Tabs page).
 */
figma.connect(
  Tabs,
  "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=146-54",
  {
    props: {
      variant: figma.enum("Variant", {
        line:      "line",
        pill:      "pill",
        segmented: "segmented",
        outline:   "outline",
      }),
      size: figma.enum("Size", {
        sm: "sm",
        md: "md",
        lg: "lg",
      }),
      icon:  figma.boolean("Icon",  { true: figma.instance("Icon slot"), false: undefined }),
      badge: figma.boolean("Badge", { true: figma.instance("Badge"),     false: undefined }),
    },
    example: ({ variant, size, icon, badge }) => (
      <Tabs
        variant={variant}
        size={size}
        items={[
          { id: "tab1", label: "Tab 1", icon, badge, content: <p>Content for tab 1</p> },
          { id: "tab2", label: "Tab 2", content: <p>Content for tab 2</p> },
          { id: "tab3", label: "Tab 3", content: <p>Content for tab 3</p> },
        ]}
      />
    ),
  }
)
