/**
 * Atlas Card — API contract v1
 *
 * Compile-time guard. If the Card props drift from this contract, tsc errors here,
 * making the breakage explicit. To make a breaking change, update this contract in
 * the same PR.
 */

import type {
  CardProps,
  CardVariant,
  CardSize,
  CardHeaderProps,
  CardTitleProps,
  CardFooterProps,
} from "@atlas/ui-web/compositions/Card/Card"
import type React from "react"

type AssertCardVariant = CardVariant extends "default" | "elevated" | "outlined" | "filled"
  ? true : false
const _v: AssertCardVariant = true; void _v

type AssertCardSize = CardSize extends "sm" | "md" | "lg"
  ? true : false
const _s: AssertCardSize = true; void _s

type AssertCardShape = {
  variant?:     CardVariant
  size?:        CardSize
  interactive?: boolean
  selected?:    boolean
  disabled?:    boolean
  onClick?:     React.MouseEventHandler<HTMLElement>
  className?:   string
  children?:    React.ReactNode
  id?:          string
}

type _CheckCardProps = AssertCardShape extends Pick<CardProps, keyof AssertCardShape & keyof CardProps>
  ? true : never
const _p: _CheckCardProps = true; void _p

type AssertCardHeaderShape = {
  leading?:   React.ReactNode
  action?:    React.ReactNode
  className?: string
  children?:  React.ReactNode
}

type _CheckCardHeaderProps = AssertCardHeaderShape extends Pick<CardHeaderProps, keyof AssertCardHeaderShape & keyof CardHeaderProps>
  ? true : never
const _h: _CheckCardHeaderProps = true; void _h

type AssertCardTitleLevel = NonNullable<CardTitleProps["as"]> extends "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
  ? true : false
const _t: AssertCardTitleLevel = true; void _t

type AssertCardFooterJustify = NonNullable<CardFooterProps["justify"]> extends "start" | "between" | "end"
  ? true : false
const _f: AssertCardFooterJustify = true; void _f
