import figma from "@figma/code-connect"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@atlas/ui-web/compositions/Card/Card"
import { Button } from "@atlas/ui-web/primitives/Button/Button"

/**
 * Atlas Card — Code Connect
 * Figma node: 110:24
 *
 * Figma variants: default | outlined | elevated | filled
 * React variants: default | outlined | elevated | filled
 * Figma State: default | hover | focus-visible | active | disabled | selected. Only selected is a
 * prop (`selected`); hover, focus-visible and active are interaction, and disabled is not mapped here.
 * Figma Content and Footer booleans show the Content slot and Footer slot.
 */
figma.connect(
  Card,
  "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=110-24",
  {
    props: {
      variant: figma.enum("Variant", {
        default:  "default",
        outlined: "outlined",
        elevated: "elevated",
        filled:   "filled",
      }),
      size: figma.enum("Size", {
        sm: "sm",
        md: "md",
        lg: "lg",
      }),
      selected: figma.enum("State", { selected: true }),
      content: figma.boolean("Content", {
        true:  <CardContent>Card content</CardContent>,
        false: undefined,
      }),
      footer: figma.boolean("Footer", {
        true:  <CardFooter><Button variant="outline" size="sm">Action</Button></CardFooter>,
        false: undefined,
      }),
    },
    example: ({ variant, size, selected, content, footer }) => (
      <Card variant={variant} size={size} selected={selected}>
        <CardHeader>
          <CardTitle>Card title</CardTitle>
          <CardDescription>Supporting description text</CardDescription>
        </CardHeader>
        {content}
        {footer}
      </Card>
    ),
  }
)
