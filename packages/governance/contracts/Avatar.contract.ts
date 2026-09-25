/**
 * Atlas Avatar — API contract v1
 */

import type {
  AvatarProps,
  AvatarGroupProps,
  AvatarShape,
  AvatarSize,
} from "@atlas/ui-web/primitives/Avatar/Avatar"
import type React from "react"

type AssertAvatarShape = AvatarShape extends "circle" | "squircle" ? true : false
const _sh: AssertAvatarShape = true; void _sh

type AssertAvatarSize = AvatarSize extends "xs" | "sm" | "md" | "lg" | "xl" ? true : false
const _s: AssertAvatarSize = true; void _s

type AssertAvatarPropsShape = {
  shape?:           AvatarShape
  size?:            AvatarSize
  src?:             string
  alt?:             string
  initials?:        string
  icon?:            React.ReactNode
  showStatus?:      boolean
  statusLabel?:     string
  statusIndicator?: React.ReactNode
  showBadgeIcon?:   boolean
  badgeIcon?:       React.ReactNode
}

type _CheckAvatarProps = AssertAvatarPropsShape extends Pick<AvatarProps, keyof AssertAvatarPropsShape & keyof AvatarProps>
  ? true : never
const _p: _CheckAvatarProps = true; void _p

type AssertAvatarGroupShape = {
  size?:     AvatarSize
  shape?:    AvatarShape
  showAdd?:  boolean
  onAdd?:    () => void
  addLabel?: string
  children:  React.ReactNode   // required — a group always holds avatars
}

type _CheckAvatarGroupProps = AssertAvatarGroupShape extends Pick<AvatarGroupProps, keyof AssertAvatarGroupShape & keyof AvatarGroupProps>
  ? true : never
const _g: _CheckAvatarGroupProps = true; void _g
