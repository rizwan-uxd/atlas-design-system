import figma from "@figma/code-connect"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/Dialog/Dialog"
import { Button } from "@/components/Button/Button"

figma.connect(
  Dialog,
  "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=136-174",
  {
    props: {
      confirmVariant: figma.enum("Variant", { default: "primary", destructive: "destructive" }),
      size:           figma.enum("Size",    { sm: "sm", md: "md", lg: "lg" }),
    },
    example: ({ confirmVariant, size }) => (
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open dialog</Button>
        </DialogTrigger>
        <DialogContent size={size}>
          <DialogHeader>
            <DialogTitle>Dialog title</DialogTitle>
            <DialogDescription>Supporting description text.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline">Cancel</Button>
            <Button variant={confirmVariant}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    ),
  }
)
