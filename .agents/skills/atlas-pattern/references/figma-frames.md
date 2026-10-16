# Figma frames for a pattern

File key `cKYhfaHLCoyMHi9nKr63Ig`. Use the tool server named `Figma` (capital F; load its tools with
`ToolSearch select:mcp__Figma__use_figma,mcp__Figma__get_screenshot`) and the `figma-use` skill before the
first `use_figma`. A lowercase `figma` server listed as failing is a different entry: ignore it.
Existing pages to copy: `Pattern / Settings` (`825:688`) and the pages beside it. Do not browse the tree.

## Page layout (copy it)
One page `Pattern / <Name>` holding one frame `<Name> pattern`, 1368 wide, vertical auto layout,
gap 48, padding 48, fill bound to `background`:
1. Title text (the pattern name) and a one-sentence summary text.
2. `Guidelines`: a row of four cards, **Use when, Don't use when, Best practices, Anti-patterns**, each a
   header plus `•` bullets taken from the doc's rules. 3 to 7 bullets in Best practices.
3. `Frames`: a vertical column of state groups. Each group is a label text (`1 Default`, `2 Loading` ...)
   above a 640 wide frame (padding 32, gap 24, bound fill and stroke, radius 12). The last group is
   `Mobile 390`: 390 wide, padding 16. Always draw Default, the main error or empty state, Loading and Mobile;
   add one frame per dialog or confirmation the doc names.

## Recipe (clone, never build from nothing)
- `page.clone()` an existing pattern page, rename it, switch with `await figma.setCurrentPageAsync(page)`.
- Edit the title, summary and the four guideline cards (clone the first bullet text per bullet, remove extras).
- Keep one state group as a template: `group.clone()` per state, set its label, clear the state frame's
  children, build the content, and remove the template group last.
- Build every state from `createInstance()` of existing component variants (`get` the variant by its exact
  name from the component set). Text overrides go on the instance's text nodes; set `fontName` loaded first.
  Clone text from the cloned page (title, guideline bullet) so its variable bindings carry over.
- Return every created node id from each script; one concern per `use_figma` call.

## Component gotchas (each bit a real session)
- **Card instance:** set the `Content#814:7320` property true before the slot exists, hide the default
  "Supporting copy..." description text, then empty the SLOT and append your content to it.
- **Table:** compose rows from Table head (`674:68`) and Table cell (`674:9`) instances with the `Text#`
  property; a five-column table does not fit 574 wide, so drop a column or use ListItem rows and say so.
- **Dialog and Sheet have no body slot** (AlertDialog has none either): to show a field inside a dialog,
  `detachInstance()` the Dialog and insert the Field instances. This is the known gap (same as CAND-049);
  mention it in the report and log it as a candidate if the user wants it recorded.
- **Field instance:** hide the leftover `Helper text` layer; set `Label` and `Placeholder` text.
- **ListItem:** props `Title#`, `Description#`, `Show media`, `Show actions`; a Media or Action swap takes
  a component id. Hidden rows in any instance still reserve the instance height.
- **Icons:** swap through the Button `Icon#` property with an icon component id from `Atlas/Icons`; check the
  property value, because a screenshot taken in the same call shows the old glyph.
- **Auto layout:** `layoutSizingHorizontal = 'FILL'` only after `appendChild`; `resize()` resets sizing.
  Geometry read in the same call as an edit is stale: read it in the next call.

## Screenshots
`get_screenshot` with `enableBase64Response: true` (the default URL is blocked by the sandbox proxy). Take
one of the whole `Frames` column and one per state you want to inspect; a node screenshot clips effects
outside the node.

## What the doc may claim
Only what the frames draw. Behaviour with no frame (grouping, Undo, focus moves, hover) is allowed in the
doc only if it is marked "not drawn in Figma yet". Report that list at the end.
