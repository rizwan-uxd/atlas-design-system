/**
 * Atlas Textarea — API contract v1
 */

import type { TextareaProps, TextareaVariant, TextareaSize, TextareaResize } from "@atlas/ui-web/primitives/Textarea/Textarea"

type AssertTextareaVariant = TextareaVariant extends "default" | "filled"
  ? true : false
const _v: AssertTextareaVariant = true; void _v

type AssertTextareaSize = TextareaSize extends "sm" | "md" | "lg"
  ? true : false
const _s: AssertTextareaSize = true; void _s

type AssertTextareaResize = TextareaResize extends "none" | "vertical" | "both"
  ? true : false
const _r: AssertTextareaResize = true; void _r

type AssertTextareaShape = {
  variant?:     TextareaVariant
  size?:        TextareaSize
  resize?:      TextareaResize
  autoGrow?:    boolean
  maxRows?:     number
  invalid?:     boolean
  disabled?:    boolean
  placeholder?: string
}

type _CheckTextareaProps = AssertTextareaShape extends Pick<TextareaProps, keyof AssertTextareaShape & keyof TextareaProps>
  ? true : never
const _p: _CheckTextareaProps = true; void _p
