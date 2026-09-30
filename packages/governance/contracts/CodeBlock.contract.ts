/**
 * Atlas CodeBlock — API contract v1
 */

import type {
  CodeBlockProps,
  CodeBlockVariant,
  CodeBlockSize,
} from "@atlas/ui-web/compositions/CodeBlock/CodeBlock"

type AssertCodeBlockVariant = CodeBlockVariant extends "default" | "typing" ? true : false
const _v: AssertCodeBlockVariant = true; void _v

type AssertCodeBlockSize = CodeBlockSize extends "sm" | "md" | "lg" ? true : false
const _s: AssertCodeBlockSize = true; void _s

type AssertCodeBlockShape = {
  code:             string    // required — a code block always shows code
  variant?:         CodeBlockVariant
  size?:            CodeBlockSize
  filename?:        string
  language?:        string
  showHeader?:      boolean
  showLineNumbers?: boolean
  copyLabel?:       string
  onCopy?:          (code: string) => void
  duration?:        number
  delay?:           number
  writing?:         boolean
  onDone?:          () => void
}

type _CheckCodeBlockProps = AssertCodeBlockShape extends Pick<CodeBlockProps, keyof AssertCodeBlockShape & keyof CodeBlockProps>
  ? true : never
const _p: _CheckCodeBlockProps = true; void _p
