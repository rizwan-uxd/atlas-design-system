import figma from "@figma/code-connect"
import { DatePicker, DatePickerTrigger, DatePickerContent } from "@atlas/ui-web/compositions/DatePicker/DatePicker"

/**
 * Atlas DatePicker — Code Connect
 * Figma nodes: 680:56 (Date Picker, State × Placeholder) · 680:29 (.Date Picker / Date, day
 * cell states incl. range-start/middle/end) · 680:146 (Date Picker Calendar) · 688:391
 * (Date Picker Calendar (range)) · 691:592 (Date Picker Calendar (dropdown), Month/Year
 * Select captions — DatePickerContent captionLayout="dropdown") · 692:654 (Examples — Input,
 * an Input instance with a trailing calendar icon — DatePickerInput) · 695:831 (Examples —
 * Natural Language, a plain Input + preview line — DatePickerNaturalInput, chrono-node parsed).
 *
 * The first node-id (680:56, the trigger) is what atlas-sync reads. The cell and calendar
 * pieces are Figma-side composition detail — DatePickerContent renders the whole panel
 * internally, so there is no exported symbol to map them to.
 */
figma.connect(DatePickerTrigger, "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=680-56", {
  props: {
    invalid: figma.enum("State", { invalid: true }),
    disabled: figma.enum("State", { disabled: true }),
    hasValue: figma.boolean("Placeholder", { true: false, false: true }),
  },
  example: ({ invalid, disabled, hasValue }) => (
    <DatePicker disabled={disabled} value={hasValue ? new Date(2026, 1, 10) : undefined}>
      <DatePickerTrigger invalid={invalid} />
      <DatePickerContent />
    </DatePicker>
  ),
})
