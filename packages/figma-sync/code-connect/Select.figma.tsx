import figma from "@figma/code-connect"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@atlas/ui-web/primitives/Select/Select"

figma.connect(Select, "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=630-75", {
  props: {
    size:        figma.enum("Size",        { sm: "sm", md: "md" }),
    disabled:    figma.enum("State",       { disabled: true }),
    invalid:     figma.enum("State",       { invalid: true }),
    placeholder: figma.enum("Placeholder", { true: true, false: false }),
  },
  example: ({ size, disabled, invalid, placeholder }) => (
    <Select disabled={disabled}>
      <SelectTrigger size={size} invalid={invalid}>
        <SelectValue placeholder={placeholder ? "Select option" : undefined} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="daily">Daily</SelectItem>
        <SelectItem value="weekly">Weekly</SelectItem>
        <SelectItem value="monthly">Monthly</SelectItem>
      </SelectContent>
    </Select>
  ),
})
