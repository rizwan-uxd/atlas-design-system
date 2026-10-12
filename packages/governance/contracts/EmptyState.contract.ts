/**
 * Atlas EmptyState — API contract v1
 */

import type { EmptyStateProps, EmptyStateSize } from "@atlas/ui-web/compositions/EmptyState/EmptyState"
import type React from "react"

type AssertEmptyStateSize = EmptyStateSize extends "sm" | "md" | "lg"
  ? true : false
const _s: AssertEmptyStateSize = true; void _s

type AssertEmptyStateShape = {
  size?:            EmptyStateSize
  icon?:            React.ReactNode
  title?:           React.ReactNode
  description?:     React.ReactNode
  action?:          React.ReactNode
  secondaryAction?: React.ReactNode
  className?:       string
}

type _CheckEmptyStateProps = AssertEmptyStateShape extends Pick<EmptyStateProps, keyof AssertEmptyStateShape & keyof EmptyStateProps>
  ? true : never
const _p: _CheckEmptyStateProps = true; void _p
