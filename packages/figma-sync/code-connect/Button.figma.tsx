import figma from "@figma/code-connect"
import { Button } from "@atlas/ui-web/primitives/Button/Button"

/**
 * Atlas Button — Code Connect
 * Figma file  : https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig
 * Component   : Atlas/Web › Button (node 19:2)
 */
figma.connect(
  Button,
  "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=19-2",
  {
    props: {
      variant: figma.enum("Variant", {
        primary:     "primary",
        secondary:   "secondary",
        outline:     "outline",
        ghost:       "ghost",
        destructive: "destructive",
        link:        "link",
      }),
      size: figma.enum("Size", {
        xs:   "xs",
        sm:   "sm",
        md:   "md",
        lg:   "lg",
      }),
      iconOnly:     figma.boolean("Icon only"),
      leadingIcon:  figma.boolean("Leading icon",  { true: figma.instance("Leading icon slot"),  false: undefined }),
      trailingIcon: figma.boolean("Trailing icon", { true: figma.instance("Trailing icon slot"), false: undefined }),
      loading:  figma.enum("State", { loading: true }),
      disabled: figma.enum("State", { disabled: true }),
    },
    example: ({ variant, size, iconOnly, leadingIcon, trailingIcon, loading, disabled }) => (
      <Button
        variant={variant}
        size={size}
        iconOnly={iconOnly}
        leadingIcon={leadingIcon}
        trailingIcon={trailingIcon}
        loading={loading}
        disabled={disabled}
      >
        Button label
      </Button>
    ),
  }
)
