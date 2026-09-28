import figma from "@figma/code-connect"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@atlas/ui-web/primitives/Table/Table"

/* The first node-id is the one atlas-sync reads. The Figma family is three sets:
   Table head (670-68 → 674:68), Table cell (674:9) and Table row (674:137). */

figma.connect(TableHead, "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=674-68", {
  props: {
    align: figma.enum("Align", { start: "start", end: "end" }),
    sort: figma.enum("Sort", { none: "none", unsorted: "unsorted", ascending: "ascending", descending: "descending" }),
    text: figma.string("Text"),
  },
  example: ({ align, sort, text }) => (
    <Table aria-label="Example">
      <TableHeader>
        <TableRow>
          <TableHead align={align} sort={sort}>{text}</TableHead>
        </TableRow>
      </TableHeader>
    </Table>
  ),
})

figma.connect(TableCell, "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=674-9", {
  props: {
    align: figma.enum("Align", { start: "start", end: "end" }),
    text: figma.string("Text"),
  },
  example: ({ align, text }) => (
    <Table aria-label="Example">
      <TableBody>
        <TableRow>
          <TableCell align={align}>{text}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
})

figma.connect(TableRow, "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=674-137", {
  props: {
    selected: figma.enum("State", { default: false, hover: false, selected: true }),
  },
  example: ({ selected }) => (
    <Table aria-label="Example">
      <TableBody>
        <TableRow selected={selected}>
          <TableCell>Cell</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
})
