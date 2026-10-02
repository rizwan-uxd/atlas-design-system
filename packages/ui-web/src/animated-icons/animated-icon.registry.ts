"use client"

import type { AnimatedIconDefinition, AnimatedIconName } from "./animated-icon.types"
import { airplayIcon } from "./icons/airplay"
import { bellIcon } from "./icons/bell"
import { checkIcon } from "./icons/check"
import { downloadIcon } from "./icons/download"
import { micIcon, micV2Icon } from "./icons/mic"
import { panelLeftOpenIcon } from "./icons/panel-left-open"
import { playPauseIcon } from "./icons/play-pause"
import { playPauseCircleIcon } from "./icons/play-pause-circle"
import { plugConnectedIcon } from "./icons/plug-connected"
import { refreshIcon } from "./icons/refresh"
import { searchIcon } from "./icons/search"
import { settingsIcon } from "./icons/settings"
import { skipBackIcon, skipForwardIcon } from "./icons/skip"
import { uploadIcon } from "./icons/upload"
import { videoIcon, videoV2Icon } from "./icons/video"
import { volumeIcon } from "./icons/volume"
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
  airplay: airplayIcon,
  volume: volumeIcon,
  mic: micIcon,
  "mic-v2": micV2Icon,
  video: videoIcon,
  "video-v2": videoV2Icon,
  "play-pause-circle": playPauseCircleIcon,
  "play-pause": playPauseIcon,
  "skip-back": skipBackIcon,
  "skip-forward": skipForwardIcon,
}

export const animatedIconNames = Object.keys(animatedIconRegistry) as AnimatedIconName[]
