import figma from "@figma/code-connect"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@atlas/ui-web/compositions/Card/Card"

/**
 * Atlas Card — Code Connect
 * Figma node: 110:24
 *
 * Figma variants: default | outlined | elevated
 * React variants: default | outlined | elevated | filled
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
      }),
      size: figma.enum("Size", {
        sm: "sm",
        md: "md",
        lg: "lg",
      }),
    },
    example: ({ variant, size }) => (
      <Card variant={variant} size={size}>
        <CardHeader>
          <CardTitle>Card title</CardTitle>
          <CardDescription>Supporting description text</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Card body content goes here.</p>
        </CardContent>
        <CardFooter>
          Footer content
        </CardFooter>
      </Card>
    ),
  }
)
