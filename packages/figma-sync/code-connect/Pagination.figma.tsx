import figma from "@figma/code-connect"
import { Pagination } from "@atlas/ui-web/patterns/Pagination/Pagination"

figma.connect(
  Pagination,
  "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=903-537",
  {
    props: {
      size: figma.enum("Size", { sm: "sm", md: "md" }),
    },
    example: ({ size }) => (
      <Pagination size={size} page={5} pageCount={10} onPageChange={(page) => console.log(page)} />
    ),
  },
)
