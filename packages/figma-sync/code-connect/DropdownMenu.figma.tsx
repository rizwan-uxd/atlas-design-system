import figma from "@figma/code-connect"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
} from "@atlas/ui-web/patterns/DropdownMenu/DropdownMenu"
import { Button } from "@atlas/ui-web/primitives/Button/Button"

/**
 * Atlas DropdownMenu — Code Connect
 * Figma nodes: 516:118 (Dropdown Menu, Groups) · 515:81 (Dropdown Menu Item, Type × State) · 516:2 (Label)
 *
 * The panel maps to DropdownMenu + DropdownMenuContent, the rows to DropdownMenuItem.
 * Type=checkbox and Type=radio map to DropdownMenuCheckboxItem and DropdownMenuRadioItem;
 * State=focus is the highlighted row and is driven by pointer or keyboard, not a prop.
 */
figma.connect(
  DropdownMenu,
  "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=516-118",
  {
    props: {
      groups: figma.enum("Groups", { "1": 1, "2": 2, "3": 3 }),
      showLabel: figma.boolean("Show Label"),
    },
    example: ({ showLabel }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Open menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {showLabel && <DropdownMenuLabel>My Account</DropdownMenuLabel>}
          <DropdownMenuGroup>
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>Settings</DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  }
)

figma.connect(
  DropdownMenuItem,
  "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=515-81",
  {
    props: {
      destructive: figma.enum("Type", { destructive: true }),
      disabled: figma.enum("State", { disabled: true }),
      label: figma.string("Label"),
      shortcut: figma.boolean("Show Shortcut", { true: figma.string("Shortcut"), false: undefined }),
    },
    example: ({ destructive, disabled, label, shortcut }) => (
      <DropdownMenuItem destructive={destructive} disabled={disabled} shortcut={shortcut}>
        {label}
      </DropdownMenuItem>
    ),
  }
)
