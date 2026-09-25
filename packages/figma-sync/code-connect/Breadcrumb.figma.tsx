import figma from "@figma/code-connect"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
  BreadcrumbDropdown,
} from "@atlas/ui-web/patterns/Breadcrumb/Breadcrumb"

/**
 * Atlas Breadcrumb — Code Connect
 * Figma node: 493:75 (Breadcrumb) · 493:48 (BreadcrumbItem, same page)
 *
 * Figma properties: Separator (chevron | dot) on Breadcrumb · Type × State on BreadcrumbItem.
 * Current Page has no Focus state in code: it is not interactive.
 */
figma.connect(
  Breadcrumb,
  "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=493-75",
  {
    props: {
      separator: figma.enum("Separator", { chevron: "chevron", dot: "dot" }),
    },
    example: ({ separator }) => (
      <Breadcrumb separator={separator}>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink href="/components">Components</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Breadcrumb</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    ),
  }
)

figma.connect(
  BreadcrumbItem,
  "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=493-48",
  {
    props: {
      type: figma.enum("Type", {
        Link: "link",
        "Current Page": "page",
        Dropdown: "dropdown",
        Ellipsis: "ellipsis",
      }),
      label: figma.string("Text"),
    },
    example: ({ type, label }) => (
      <BreadcrumbItem>
        {type === "link" && <BreadcrumbLink href="/">{label}</BreadcrumbLink>}
        {type === "page" && <BreadcrumbPage>{label}</BreadcrumbPage>}
        {type === "dropdown" && <BreadcrumbDropdown>{label}</BreadcrumbDropdown>}
        {type === "ellipsis" && <BreadcrumbEllipsis />}
      </BreadcrumbItem>
    ),
  }
)
