/**
 * Atlas Tabs — API contract v1
 */

import type { TabsRootProps, TabsVariant, TabsSize } from "@atlas/ui-web/patterns/Tabs/Tabs"

type AssertTabsVariant = TabsVariant extends "line" | "pill" | "segmented"
  ? true : false
const _variant: AssertTabsVariant = true; void _variant

type AssertTabsSize = TabsSize extends "sm" | "md" | "lg"
  ? true : false
const _size: AssertTabsSize = true; void _size

type AssertTabsRootShape = {
  variant?:        TabsVariant
  size?:           TabsSize
  value?:          string
  defaultValue?:   string
  onValueChange?:  (value: string) => void
  activationMode?: "automatic" | "manual"
  className?:      string
}

type _CheckTabsRootProps = AssertTabsRootShape extends Pick<TabsRootProps, keyof AssertTabsRootShape & keyof TabsRootProps>
  ? true : never
const _p: _CheckTabsRootProps = true; void _p
