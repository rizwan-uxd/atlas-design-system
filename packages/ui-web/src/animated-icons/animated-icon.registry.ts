"use client"

import type { AnimatedIconDefinition, AnimatedIconName } from "./animated-icon.types"
import { bellIcon } from "./icons/bell"
import { checkIcon } from "./icons/check"
import { downloadIcon } from "./icons/download"
import { panelLeftOpenIcon } from "./icons/panel-left-open"
import { plugConnectedIcon } from "./icons/plug-connected"
import { refreshIcon } from "./icons/refresh"
import { searchIcon } from "./icons/search"
import { settingsIcon } from "./icons/settings"
import { uploadIcon } from "./icons/upload"
import { xIcon } from "./icons/x"

/** Name → definition. Typed as a full Record, so adding a name to `AnimatedIconName` fails the build until it is registered. */
export const animatedIconRegistry: Record<AnimatedIconName, AnimatedIconDefinition> = {
  check: checkIcon,
  x: xIcon,
  search: searchIcon,
  settings: settingsIcon,
  download: downloadIcon,
  upload: uploadIcon,
  refresh: refreshIcon,
  bell: bellIcon,
  "plug-connected": plugConnectedIcon,
  "panel-left-open": panelLeftOpenIcon,
}

export const animatedIconNames = Object.keys(animatedIconRegistry) as AnimatedIconName[]
