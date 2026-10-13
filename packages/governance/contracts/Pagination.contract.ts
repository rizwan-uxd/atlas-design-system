/**
 * Atlas Pagination — API contract v1
 */

import type { PaginationProps, PaginationSize } from "@atlas/ui-web/patterns/Pagination/Pagination"

type AssertPaginationSize = PaginationSize extends "sm" | "md" ? true : false
const _s: AssertPaginationSize = true; void _s

type AssertPaginationShape = {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  siblingCount?: number
  size?: PaginationSize
  disabled?: boolean
  className?: string
}
type _CheckPaginationProps = AssertPaginationShape extends Pick<PaginationProps, keyof AssertPaginationShape & keyof PaginationProps> ? true : never
const _p: _CheckPaginationProps = true; void _p
