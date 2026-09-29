/**
 * Atlas Tabs — API contract v1
 */

import type { TabsRootProps, TabsVariant, TabsSize, TabsOrientation } from "@atlas/ui-web/patterns/Tabs/Tabs"

type AssertTabsVariant = TabsVariant extends "line" | "pill" | "segmented" | "outline"
  ? true : false
const _variant: AssertTabsVariant = true; void _variant

type AssertTabsSize = TabsSize extends "sm" | "md" | "lg"
  ? true : false
const _size: AssertTabsSize = true; void _size

type AssertTabsOrientation = TabsOrientation extends "horizontal" | "vertical"
  ? true : false
const _orientation: AssertTabsOrientation = true; void _orientation

type AssertTabsRootShape = {
  variant?:        TabsVariant
  size?:           TabsSize
  orientation?:    TabsOrientation
  value?:          string
  defaultValue?:   string
  onValueChange?:  (value: string) => void
  activationMode?: "automatic" | "manual"
  className?:      string
}

type _CheckTabsRootProps = AssertTabsRootShape extends Pick<TabsRootProps, keyof AssertTabsRootShape & keyof TabsRootProps>
  ? true : never
const _p: _CheckTabsRootProps = true; void _p
