import figma from "@figma/code-connect"
import { EmptyState } from "@atlas/ui-web/compositions/EmptyState/EmptyState"

figma.connect(
  EmptyState,
  "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=858-60",
  {
    props: {
      size:            figma.enum("Size", { sm: "sm", md: "md", lg: "lg" }),
      icon:            figma.instance("Icon"),
      title:           figma.string("Title"),
      description:     figma.string("Description"),
      action:          figma.instance("Action"),
      secondaryAction: figma.boolean("Secondary", {
        true:  figma.instance("Secondary action"),
        false: undefined,
      }),
    },
    example: ({ size, icon, title, description, action, secondaryAction }) => (
      <EmptyState
        size={size}
        icon={icon}
        title={title}
        description={description}
        action={action}
        secondaryAction={secondaryAction}
      />
    ),
  }
)
