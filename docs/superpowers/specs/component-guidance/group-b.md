## Breadcrumb
USE WHEN
· The page sits two or more levels deep and the user needs to jump back up the hierarchy.
· A detail page (record, article, setting) needs its parent chain shown above the title.
· The path is long and middle levels can collapse behind an ellipsis.
DON'T USE WHEN
· Primary site navigation → NavBar
· Switching views of the same page → Tabs
· A top-level page with no parent → omit it
HOW TO USE
· Compose Breadcrumb > BreadcrumbList > BreadcrumbItem, with BreadcrumbLink per ancestor and BreadcrumbPage for the current page, separated by BreadcrumbSeparator.
· Default separator is chevron; set separator="dot" only to match a denser or quieter header.
· Make the last item BreadcrumbPage (current page, not a link); every earlier item is a BreadcrumbLink.
· For long paths use BreadcrumbEllipsis (label defaults to "Show more", keep it) or BreadcrumbDropdown, and supply the menu with DropdownMenu.
· Labels are the page names, short, no trailing punctuation.
DO
· Start at the highest useful ancestor and end at the current page.
· Keep the same labels as the page titles they point to.
DON'T
· Make the current page a link.
· Use it as the only way to move between sibling pages.
RELATED
· NavBar — global top-level links; Breadcrumb shows where you are inside one section.
· Tabs — peer views on one page; Breadcrumb moves up a hierarchy.

## DropdownMenu
USE WHEN
· A button or avatar should reveal a compact list of actions (account menu, row actions, "More").
· The user picks sort or view options: checkbox items for independent toggles, radio items for one choice.
· A breadcrumb item or toolbar button needs a short menu behind it.
DON'T USE WHEN
· A form field must submit a chosen value → Select
· Moving between pages or views → NavBar or Tabs
· The message needs a decision or confirmation → Dialog or AlertDialog
· The content is a hint only → Tooltip
HOW TO USE
· Compose DropdownMenu > DropdownMenuTrigger asChild (wrap a Button) + DropdownMenuContent > DropdownMenuItem, with DropdownMenuGroup, DropdownMenuLabel and DropdownMenuSeparator to organise.
· Content opens below by default; set side="top" only near the bottom of the viewport.
· Use DropdownMenuCheckboxItem (checked, onCheckedChange) for toggles, DropdownMenuRadioGroup (value, onValueChange) + DropdownMenuRadioItem (value required) for one-of-many; nest with DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent.
· Mark delete-style rows destructive and place them last, after a separator. Use onSelect for the action.
· Item labels are verb-first, sentence case, one line; shortcut shows a hint only. The trigger needs a visible label or aria-label when icon-only.
DO
· Group related items and separate groups with a divider.
· Keep the menu under about 8 items before grouping.
DON'T
· Put a form control that submits with a form in it.
· Nest submenus more than one level.
RELATED
· Select — form field that submits a value; DropdownMenu runs actions.
· Tabs — persistent view switching; DropdownMenu is transient.
NOTE: atlas/DropdownMenu.md says "a select is not part of v1.1" but Select exists in the library.

## NavBar
USE WHEN
· The app or site needs a persistent top header with brand, primary links and actions.
· A responsive web layout needs a header that collapses to a menu on small screens.
· A marketing page needs a header over hero imagery (transparent) or one that hides on scroll.
DON'T USE WHEN
· Switching views within a page → Tabs
· A dashboard side navigation list → Sidebar
· Showing the page path → Breadcrumb (pass it into the breadcrumb prop)
· Screens inside a phone-frame prototype → use that flow's own header
HOW TO USE
· Render <NavBar brand links actions />; links are { label, href, active?, disabled?, leadingIcon?, badge? }.
· Defaults are variant="default" and size="md". Use transparent only over hero imagery, bordered to separate from flat content, floating for an inset bar.
· Set active on the link for the current route (it sets aria-current="page"); set brandHref to home.
· Use the search and breadcrumb slots for those elements; use hideOnScroll only on long reading pages.
· Put at most one primary action in actions; keep to about five links.
DO
· Mark exactly one link active.
· Keep link labels one or two words.
DON'T
· Put more than five primary links or two primary buttons in the bar.
· Use it for in-page view switching.
RELATED
· Sidebar — vertical app navigation; NavBar is the top header.
· Tabs — in-page views; NavBar changes routes.
· Breadcrumb — path to current page; NavBar is global navigation.
NOTE: atlas/NavBar.md mentions a mobile bottom tab bar as a separate native pattern, while NavBarHeader and NavBarTabBar exist in the web file.

## ScrollProgress
USE WHEN
· A long article, doc or reading view where "how far through am I" helps.
· A scrollable container (changelog, long panel) should show its own reading position.
· A reading view needs a thin position cue pinned to the top of the viewport.
DON'T USE WHEN
· Task, upload or step progress → Progress
· Content is still loading → Skeleton or Spinner
· The page is short, or it would be the only cue of position → omit it
HOW TO USE
· Default is scope="page", orientation="horizontal": a flat strip fixed to the top of the viewport that follows the window scroll.
· For a scrollable element use scope="container", pass target (a ref to the element) and place the bar yourself beside that element.
· Use orientation="vertical" (a rail) only for a tall, narrow layout; set axis to the scroll direction that is tracked.
· It is decorative and hidden from assistive tech; add aria-label only if the position must be exposed as a progressbar.
· It takes no content and is not a value you set; do not pass a percentage.
DO
· Mount one page-scope bar per page.
· Give container scope a target whose scroll you mean to track.
DON'T
· Drive it with task or form completion.
· Stack a page bar and a NavBar without checking they do not overlap.
RELATED
· Progress — a known value you set; ScrollProgress follows scroll position.
· Skeleton — loading placeholder; ScrollProgress is for loaded content.

## Select
USE WHEN
· The user picks one option from a predefined list of more than five (country, currency, frequency).
· A form field or dashboard filter chooses a single value.
· The options are long enough to need grouping.
DON'T USE WHEN
· Two to five visible options → RadioGroup
· Triggering an action, not choosing a value → DropdownMenu
· Choosing several values (single choice only) → Checkbox
· Navigating between pages → NavBar or Tabs
HOW TO USE
· Compose Select (value or defaultValue, onValueChange, name, required, disabled) > SelectTrigger > SelectValue placeholder + SelectContent > SelectItem value="..." (value required).
· SelectTrigger default size is md (40px); use sm (32px) in dense toolbars and filter rows. Match the neighbouring Input.
· Group long lists with SelectGroup, SelectLabel and SelectSeparator; content opens below, side="top" only when space requires.
· Pair with a Label for the trigger id; set invalid on the trigger and show a visible error message beside it.
· Placeholder describes the choice ("Select frequency"); option labels are short and sentence case.
DO
· Set a placeholder that names the expected choice.
· Keep labels short and scannable.
DON'T
· Use it to run actions or navigate.
· Rely on colour alone for the invalid state.
RELATED
· DropdownMenu — runs actions; Select commits a form value.
· RadioGroup — all options visible, five or fewer; Select hides them.
· Input — free text; Select restricts to a list.
NOTE: atlas/Select.md says RadioGroup for fewer than 3 options but also ">5" for Select; guidance here uses five or fewer vs more than five.

## Sidebar
USE WHEN
· A dashboard or app shell needs a persistent vertical navigation with sections.
· There are more destinations than fit in a top bar, grouped into sections.
· The nav should collapse to an icon-only rail.
DON'T USE WHEN
· A top header with brand, few links and actions → NavBar
· A temporary panel opened by a button → Drawer
· Page path or hierarchy → Breadcrumb
· In-page view switching → Tabs
HOW TO USE
· Compose Sidebar > SidebarHeader, SidebarBody > SidebarSection label="..." > SidebarMenuRow items, SidebarFooter, and SidebarCollapseToggle.
· Control collapse with the collapsed prop (default false, expanded). Pass SidebarCollapseToggle an onClick that flips your state.
· It renders an <aside> with aria-label "Sidebar" by default; override with aria-label if there is more than one sidebar.
· SidebarSection label names a group and is hidden when collapsed; the toggle sets aria-expanded and its own label.
· In a collapsed rail rows must still carry an icon, since labels are hidden.
DO
· Give every SidebarMenuRow an icon so it survives collapse.
· Group rows into labelled sections.
DON'T
· Put page content or forms inside it.
· Use both a Sidebar and a NavBar link list for the same destinations.
RELATED
· NavBar — horizontal top header; Sidebar is the vertical shell.
· SidebarMenuRow — the rows that go inside Sidebar.
· Drawer — temporary overlay; Sidebar is persistent.
NOTE: Sidebar accepts onCollapsedChange but the source never calls it; wire the toggle's onClick yourself. No atlas/Sidebar.md exists.

## SidebarMenuRow
USE WHEN
· A row in a Sidebar nav list: icon, label, optional count or status.
· A nav item needs one level of nested rows (parent with children).
· A nav item should show current location with colour only.
DON'T USE WHEN
· A top-bar link → NavBar
· A row of content in a list → ListItem
· A row of actions in a popup → DropdownMenu
· A standalone button → Button
HOW TO USE
· Place inside SidebarSection. Give icon and children (label, required); use as="a" with href for routes, default as="button" for actions or expanders.
· Mark the current location active; for a parent with visible children set hasChildren and expanded, which shows the chevron and a bolder label.
· Nest SidebarMenuRowChild (as, href, active, badge, disabled) for one level of children only.
· Pass a Badge in badge for a count or status; use disabled for unavailable items.
· Keep labels one or two words, sentence case.
DO
· Use active for the selected leaf; it recolours icon and label only.
· Set hasChildren only when children exist.
DON'T
· Add a background fill to the active row.
· Show a chevron on a leaf row, or nest children two levels deep.
RELATED
· ListItem — content row in the page; SidebarMenuRow is navigation chrome.
· NavBar link — horizontal header link; SidebarMenuRow is vertical.

## Skeleton
USE WHEN
· Content with a known layout is loading (list row, card, form, table) and arrives in a few seconds.
· An avatar or thumbnail area needs a round placeholder.
· You want to avoid layout shift while data loads.
DON'T USE WHEN
· Unknown wait with no layout → Spinner
· A known percentage → Progress
· Empty or error states → Alert or plain empty-state text
· Content that is already loaded → render it
HOW TO USE
· Compose several Skeleton blocks into the shape of the real content; each fills its container's width.
· Default shape="rect"; use shape="circle" for avatars. Size it with className or the layout, since it has no size prop.
· Set aria-busy="true" on the loading container; the blocks themselves are hidden from assistive tech.
· Swap the skeleton for real content in place when loaded.
· Match the real content's block count and proportions.
DO
· Mirror the final layout's rows and widths.
· Announce loading on the container, not the blocks.
DON'T
· Use a skeleton for waits over a few seconds with no end.
· Add text or icons inside a block.
RELATED
· Spinner — unknown wait, no layout; Skeleton shows the layout.
· Progress — known value; Skeleton is indeterminate.

## Slider
USE WHEN
· A value on a continuous scale where position matters more than the exact number (volume, brightness).
· A range between a minimum and a maximum (price range, date window) with range.
· A setting adjusts live and benefits from dragging.
DON'T USE WHEN
· An exact number is typed in → Input
· A few named options → RadioGroup or Select
· Progress the user does not control → Progress
HOW TO USE
· Set min, max and step; control with value and onValueChange (or defaultValue). Defaults to horizontal; use orientation="vertical" only in a tall, narrow layout.
· For two thumbs set range and use a [min, max] tuple for value; the thumbs cannot cross.
· Give it a name: label, or aria-label / aria-labelledby. Show the current value as text through valueLabel; use getAriaValueText for units.
· Use helperText, leading and trailing for hints and end icons; disabled for unavailable.
· Keys: arrows step, PageUp/PageDown take 10 steps, Home/End jump to ends.
DO
· Show the current value as visible text.
· Pick a step that suits the scale.
DON'T
· Use it for values where precision matters.
· Leave a thumb unlabelled.
RELATED
· Input — exact typed number; Slider is approximate by position.
· Progress — read-only value; Slider is user-controlled.
· RadioGroup — a few named options; Slider is continuous.

## Spinner
USE WHEN
· A short, indeterminate wait such as a button submitting or a section loading.
· A toast or inline status needs a "working" indicator.
· Duration and progress are unknown.
DON'T USE WHEN
· A known percentage → Progress
· Loading a page or card whose layout is known → Skeleton
· Decorative motion with no wait → omit it
HOW TO USE
· Default variant="default" and size="md"; use xs or sm inside buttons and inline text, lg for a section-level wait. variant="custom" is the eight-tick style, a visual choice only.
· It has role=status with a label that defaults to "Loading"; set label to something specific ("Saving changes").
· It inherits the surrounding text colour.
· Put it in the area that is loading and remove it when done.
DO
· Set a specific label.
· Replace it with content or an error, never leave it spinning.
DON'T
· Use it for waits the user watches for more than a few seconds without an explanation.
· Add your own animation to it.
RELATED
· Skeleton — layout-shaped loading; Spinner is shapeless.
· Progress — determinate value; Spinner is indeterminate.

## Switch
USE WHEN
· A preference or setting takes effect immediately, with no save step.
· A binary on/off feature toggle in a settings list.
· The row has a label and optional description.
DON'T USE WHEN
· The value is submitted later with a form → Checkbox
· Choosing between two named options → Tabs (segmented)
· The action is destructive or irreversible → Button
· Choosing one of several → RadioGroup
HOW TO USE
· Default size="md"; use sm for dense lists and lg for touch-first layouts.
· Control with checked and onCheckedChange, or defaultChecked. Pass label (and description) so it is named; give an id when a separate Label points at it.
· Use invalid for a validation problem with a visible message, required where applicable, disabled when unavailable.
· It is a button with switch semantics; Space or Enter toggles.
· Write labels as affirmative settings, "Push notifications", not "Disable push".
DO
· Make the change real the moment it is toggled.
· Write an affirmative label.
DON'T
· Put a Switch in a form that has a Submit for the same value.
· Use it for a choice that needs confirmation.
RELATED
· Checkbox — submitted with a form or multi-select; Switch applies instantly.
· RadioGroup — pick one of several; Switch is on/off.
· Tabs — segmented choice of named views; Switch is boolean.

## Table
USE WHEN
· Comparing rows of structured data across the same columns (users, invoices, orders).
· A column needs a sort control or right-aligned numbers.
· A row-selection column is needed (select-all Checkbox in the head).
DON'T USE WHEN
· A single record's fields → Card
· A simple list of items without columns → ListItem
· Numeric trends → Chart
· Sorting, pagination, filtering and column visibility logic → a future DataTable; build that logic yourself
HOW TO USE
· Compose Table > TableHeader > TableRow > TableHead, TableBody > TableRow > TableCell, optional TableFooter and TableCaption.
· On TableHead set sort ("none" default when not sortable, else "unsorted" | "ascending" | "descending") and onSort. Table does not sort data; you do.
· Set align="end" on numeric TableHead and matching TableCell so figures line up. Align is logical and flips in RTL.
· Use TableRow selected for a selected row; put a Checkbox in the head and cells for selection.
· Head labels are one or two words; add a TableCaption describing the table.
DO
· Show a sort state on one column only.
· Keep the same column order in head and body.
DON'T
· Use sort="none" on a column that is actually sortable.
· Put filters or actions inside head cells; put them in a toolbar above.
RELATED
· Card — one record; Table compares many.
· ListItem — stacked list rows; Table has aligned columns.
· Chart — visual trend; Table gives exact values.
NOTE: atlas/Table.md documents only the Table head part; the metadata shows the whole family, and this entry follows the metadata.

## Tabs
USE WHEN
· Two to five peer views of the same subject share one page.
· A segmented choice between named options is needed.
· Counts or icons help label each view.
DON'T USE WHEN
· The views are steps in a sequence → a flow
· Choosing a route or page → NavBar
· A binary setting → Switch
· A menu of actions → DropdownMenu
HOW TO USE
· Quick path: <Tabs items activeTab|defaultTab onTabChange /> with items { id, label, content, icon?, badge?, disabled? }.
· Custom path: TabsRoot > TabsList (aria-label) > TabsTrigger value + TabsPanel value, one panel per trigger.
· Defaults: variant="line", size="md". Use pill or outline for contained surfaces, segmented for a compact either-or choice; sm for dense toolbars, lg for prominent switching.
· Set orientation="vertical" for side tabs; activationMode="manual" only if panels are costly to load; animated is opt-in motion.
· Labels are one or two words, noun-based; use badge for counts.
DO
· Keep panel content the same shape across tabs.
· Name the TabsList with aria-label.
DON'T
· Build a segmented control from plain Buttons; use variant="segmented".
· Hide a required form field behind an unselected tab.
RELATED
· NavBar — navigates between routes; Tabs switches views in place.
· Switch — one boolean setting; Tabs choose between named views.
· Breadcrumb — path up a hierarchy; Tabs are siblings.

## Textarea
USE WHEN
· Notes, messages, descriptions or any text that can exceed one line.
· Feedback or comment fields that should grow with content.
· A multiline field with a visible character limit.
DON'T USE WHEN
· The value stays on one line → Input
· Choosing from a fixed list → Select
· Showing read-only code or long text → CodeBlock or plain text
HOW TO USE
· Defaults: variant="default", size="md", resize="vertical". Use filled on tinted surfaces; unstyled only inside a container that supplies its own border; sm/lg to match neighbouring fields.
· Pair with a Label whose htmlFor matches the textarea id; placeholder is not a label.
· For growing fields set autoGrow with maxRows; for limits set maxLength and showCount.
· Set invalid and show a visible error message, not colour alone; required where needed.
· Keep resize to none or vertical; horizontal resize breaks layouts.
DO
· Pair it with a Label.
· Show the limit if one is enforced.
DON'T
· Hide an enforced character limit.
· Use placeholder as the only label.
RELATED
· Input — single line; Textarea is multiline.
· Select — fixed list; Textarea is free text.

## Tooltip
USE WHEN
· Naming an icon-only button or control.
· Adding a short hint or keyboard shortcut to a control.
· Explaining an info icon with one sentence.
DON'T USE WHEN
· The content is essential to finish the task → helper text or inline copy
· The content is interactive (links, buttons, forms) → DropdownMenu or Dialog
· The content is long or rich → Dialog or inline copy
· On touch-only flows, where hover is unavailable → inline text
HOW TO USE
· Compose TooltipProvider (once near the root) > Tooltip > TooltipTrigger asChild (a focusable element) + TooltipContent.
· TooltipContent default side="top"; other values bottom, start, end (logical, flip in RTL). It flips on its own near the viewport edge.
· Keep text to one short line (under about 10 words), sentence case, no trailing period.
· The trigger must be focusable so keyboard users reach it; wrap a disabled control in a focusable element.
· Do not repeat the trigger's visible label.
DO
· Use it to name icon-only controls.
· Attach it to a focusable trigger.
DON'T
· Put essential or interactive content in it.
· Stack or nest tooltips.
RELATED
· Dialog — rich or blocking content; Tooltip is a one-line hint.
· Toast — event feedback; Tooltip explains a control.
· DropdownMenu — interactive options; Tooltip is non-interactive.
NOTE: atlas/Tooltip.md refers to a Popover, which does not exist in the library; replaced with DropdownMenu or Dialog.
