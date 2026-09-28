import figma from "@figma/code-connect"
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastClose,
} from "@atlas/ui-web/compositions/Toast/Toast"

figma.connect(Toast, "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=670-68", {
  props: {
    variant: figma.enum("Variant", { default: "default", success: "success", danger: "danger" }),
    icon: figma.boolean("Icon"),
    title: figma.boolean("Title", { true: figma.string("Title text"), false: undefined }),
    description: figma.boolean("Description", { true: figma.string("Description text"), false: undefined }),
    action: figma.boolean("Action"),
    close: figma.boolean("Close"),
  },
  example: ({ variant, icon, title, description, action, close }) => (
    <ToastProvider>
      <Toast variant={variant} icon={icon} open>
        {title && <ToastTitle>{title}</ToastTitle>}
        {description && <ToastDescription>{description}</ToastDescription>}
        {action && <ToastAction altText="Undo">Undo</ToastAction>}
        {close && <ToastClose />}
      </Toast>
      <ToastViewport />
    </ToastProvider>
  ),
})
