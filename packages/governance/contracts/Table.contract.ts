import type {
  TableAlign,
  TableSort,
  TableHeadProps,
  TableCellProps,
  TableRowProps,
} from "@atlas/ui-web/primitives/Table/Table"

type AssertTableAlign = TableAlign extends "start" | "end" ? true : false
const _a: AssertTableAlign = true; void _a

type AssertTableAlignExhaustive = "start" | "end" extends TableAlign ? true : false
const _ae: AssertTableAlignExhaustive = true; void _ae

type AssertTableSort = TableSort extends "none" | "unsorted" | "ascending" | "descending" ? true : false
const _s: AssertTableSort = true; void _s

type AssertTableSortExhaustive = "none" | "unsorted" | "ascending" | "descending" extends TableSort ? true : false
const _se: AssertTableSortExhaustive = true; void _se

type AssertTableHeadShape = { align?: TableAlign; sort?: TableSort; onSort?: () => void }
type _CheckTableHeadProps = AssertTableHeadShape extends Pick<TableHeadProps, keyof AssertTableHeadShape & keyof TableHeadProps> ? true : never
const _h: _CheckTableHeadProps = true; void _h

type AssertTableCellShape = { align?: TableAlign }
type _CheckTableCellProps = AssertTableCellShape extends Pick<TableCellProps, keyof AssertTableCellShape & keyof TableCellProps> ? true : never
const _c: _CheckTableCellProps = true; void _c

type AssertTableRowShape = { selected?: boolean }
type _CheckTableRowProps = AssertTableRowShape extends Pick<TableRowProps, keyof AssertTableRowShape & keyof TableRowProps> ? true : never
const _r: _CheckTableRowProps = true; void _r
