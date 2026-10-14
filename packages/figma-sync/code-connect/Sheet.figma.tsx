import figma from "@figma/code-connect"
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetBody, SheetFooter } from "@atlas/ui-web/compositions/Sheet/Sheet"
import { Button } from "@atlas/ui-web/primitives/Button/Button"

figma.connect(
  Sheet,
  "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=583-2861",
  {
    props: {
      side: figma.enum("Side", { bottom: "bottom", top: "top", start: "start", end: "end" }),
      content: figma.boolean("Content", { true: <SheetBody>Content placeholder</SheetBody>, false: undefined }),
      footer: figma.boolean("Footer", { true: <SheetFooter><Button>Action</Button></SheetFooter>, false: undefined }),
    },
    example: ({ side, content, footer }) => (
      <Sheet>
        <SheetTrigger asChild>
          <Button>Open sheet</Button>
        </SheetTrigger>
        <SheetContent side={side}>
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
            <SheetDescription>Sheet description</SheetDescription>
          </SheetHeader>
          {content}
          {footer}
        </SheetContent>
      </Sheet>
    ),
  }
)
