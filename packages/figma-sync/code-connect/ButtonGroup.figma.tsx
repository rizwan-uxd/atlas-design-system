import figma from "@figma/code-connect"
import {
  ButtonGroup,
  ButtonGroupButton,
  ButtonGroupIconButton,
} from "@atlas/ui-web/compositions/ButtonGroup/ButtonGroup"

/**
 * Atlas ButtonGroup — Code Connect
 * Figma file  : https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig
 * Components  : Atlas/Web › Button Group — ButtonGroup (666:5817),
 *               ButtonGroupButton (666:836), ButtonGroupIconButton (666:5720)
 */
figma.connect(
  ButtonGroup,
  "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=666-5817",
  {
    props: {
      orientation: figma.enum("Orientation", {
        horizontal: "horizontal",
        vertical:   "vertical",
      }),
      size: figma.enum("Size", {
        sm: "sm",
        md: "md",
        lg: "lg",
      }),
    },
    example: ({ orientation, size }) => (
      <ButtonGroup orientation={orientation} size={size} aria-label="Actions">
        <ButtonGroupButton>Left</ButtonGroupButton>
        <ButtonGroupButton>Middle</ButtonGroupButton>
        <ButtonGroupButton>Right</ButtonGroupButton>
      </ButtonGroup>
    ),
  },
)

figma.connect(
  ButtonGroupButton,
  "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=666-836",
  {
    props: {
      variant: figma.enum("Variant", {
        outline:   "outline",
        secondary: "secondary",
        ghost:     "ghost",
      }),
      size: figma.enum("Size", {
        sm: "sm",
        md: "md",
        lg: "lg",
      }),
      position: figma.enum("Position", {
        left:   "left",
        middle: "middle",
        right:  "right",
        top:    "top",
        bottom: "bottom",
        single: "single",
      }),
      disabled: figma.enum("State", { disabled: true }),
    },
    example: ({ variant, size, position, disabled }) => (
      <ButtonGroupButton variant={variant} size={size} position={position} disabled={disabled}>
        Button
      </ButtonGroupButton>
    ),
  },
)

figma.connect(
  ButtonGroupIconButton,
  "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=666-5720",
  {
    props: {
      variant: figma.enum("Variant", {
        outline:   "outline",
        secondary: "secondary",
        ghost:     "ghost",
      }),
      size: figma.enum("Size", {
        sm: "sm",
        md: "md",
        lg: "lg",
      }),
      position: figma.enum("Position", {
        left:   "left",
        middle: "middle",
        right:  "right",
        top:    "top",
        bottom: "bottom",
        single: "single",
      }),
      disabled: figma.enum("State", { disabled: true }),
    },
    example: ({ variant, size, position, disabled }) => (
      <ButtonGroupIconButton
        variant={variant}
        size={size}
        position={position}
        disabled={disabled}
        aria-label="Add"
      />
    ),
  },
)
