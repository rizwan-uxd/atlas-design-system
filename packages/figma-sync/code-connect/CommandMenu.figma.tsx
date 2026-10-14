import figma from "@figma/code-connect"
import { CommandMenu, CommandMenuContent, CommandMenuGroup, CommandMenuItem } from "@atlas/ui-web/compositions/CommandMenu/CommandMenu"

figma.connect(
  CommandMenuContent,
  "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=990-211",
  {
    props: {
      size:    figma.enum("Size", { md: "md", lg: "lg" }),
      loading: figma.enum("State", { loading: true }),
    },
    example: ({ size, loading }) => (
      <CommandMenu>
        <CommandMenuContent size={size} loading={loading} label="Command menu">
          <CommandMenuGroup heading="Suggestions">
            <CommandMenuItem shortcut="⌘N">New document</CommandMenuItem>
            <CommandMenuItem shortcut="⌘O">Open recent</CommandMenuItem>
          </CommandMenuGroup>
        </CommandMenuContent>
      </CommandMenu>
    ),
  },
)
