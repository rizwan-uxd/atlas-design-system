import figma from "@figma/code-connect"
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerBody } from "@atlas/ui-web/compositions/Drawer/Drawer"
import { Button } from "@atlas/ui-web/primitives/Button/Button"

figma.connect(
  Drawer,
  "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=577-24",
  {
    props: {
      side: figma.enum("Side", { start: "start", end: "end" }),
    },
    example: ({ side }) => (
      <Drawer>
        <DrawerTrigger asChild>
          <Button>Open drawer</Button>
        </DrawerTrigger>
        <DrawerContent side={side}>
          <DrawerHeader>
            <DrawerTitle>Menu</DrawerTitle>
            <DrawerDescription>Drawer description</DrawerDescription>
          </DrawerHeader>
          <DrawerBody>Content placeholder</DrawerBody>
        </DrawerContent>
      </Drawer>
    ),
  }
)
