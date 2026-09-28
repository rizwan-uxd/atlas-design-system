import figma from "@figma/code-connect"
import { Tooltip, TooltipTrigger, TooltipContent } from "@atlas/ui-web/primitives/Tooltip/Tooltip"
import { Button } from "@atlas/ui-web/primitives/Button/Button"

figma.connect(TooltipContent, "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=645-397", {
  props: {
    side: figma.enum("Side", { bottom: "bottom", top: "top", start: "start", end: "end" }),
    text: figma.string("Text"),
  },
  example: ({ side, text }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Trigger</Button>
      </TooltipTrigger>
      <TooltipContent side={side}>{text}</TooltipContent>
    </Tooltip>
  ),
})
