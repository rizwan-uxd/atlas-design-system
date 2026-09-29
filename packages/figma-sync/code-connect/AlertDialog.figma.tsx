import figma from "@figma/code-connect"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@atlas/ui-web/compositions/AlertDialog/AlertDialog"

figma.connect(
  AlertDialogContent,
  "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=700-6560",
  {
    props: {
      variant: figma.enum("Variant", { default: "default", destructive: "destructive" }),
      size:    figma.enum("Size",    { sm: "sm", md: "md", lg: "lg" }),
      state:   figma.enum("State",   { default: "default", loading: "loading" }),
    },
    example: ({ variant, size, state }) => (
      <AlertDialog>
        <AlertDialogTrigger>
          <button>Open</button>
        </AlertDialogTrigger>
        <AlertDialogContent variant={variant} size={size} state={state}>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ),
  }
)
