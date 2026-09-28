import type React from "react"
import type { ToastProps, ToastVariant } from "@atlas/ui-web/compositions/Toast/Toast"

type AssertToastVariant = ToastVariant extends "default" | "success" | "danger" ? true : false
const _v: AssertToastVariant = true; void _v

type AssertToastVariantExhaustive = "default" | "success" | "danger" extends ToastVariant ? true : false
const _e: AssertToastVariantExhaustive = true; void _e

type AssertToastShape = { variant?: ToastVariant; icon?: React.ReactNode | boolean; open?: boolean }
type _CheckToastProps = AssertToastShape extends Pick<ToastProps, keyof AssertToastShape & keyof ToastProps> ? true : never
const _p: _CheckToastProps = true; void _p
