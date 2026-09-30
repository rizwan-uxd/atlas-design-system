import figma from "@figma/code-connect"
import { CodeBlock } from "@atlas/ui-web/compositions/CodeBlock/CodeBlock"

/**
 * Atlas CodeBlock — Code Connect
 * Figma node: 731:108 (Code Block)
 *
 * Figma properties: Variant (default | typing) · Size (sm | md | lg) · Show header · Show line numbers ·
 * Label (header text → filename) · Code (the snippet).
 */
figma.connect(
  CodeBlock,
  "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=731-108",
  {
    props: {
      variant: figma.enum("Variant", { default: "default", typing: "typing" }),
      size: figma.enum("Size", { sm: "sm", md: "md", lg: "lg" }),
      showHeader: figma.boolean("Show header"),
      showLineNumbers: figma.boolean("Show line numbers"),
      filename: figma.string("Label"),
      code: figma.string("Code"),
    },
    example: ({ variant, size, showHeader, showLineNumbers, filename, code }) => (
      <CodeBlock
        variant={variant}
        size={size}
        showHeader={showHeader}
        showLineNumbers={showLineNumbers}
        filename={filename}
        code={code}
      />
    ),
  }
)
