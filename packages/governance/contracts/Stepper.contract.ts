/**
 * Atlas Stepper — API contract v1
 */

import type React from "react"
import type {
  StepperOrientation,
  StepperProps,
  StepperStatus,
  StepperStep,
} from "@atlas/ui-web/patterns/Stepper/Stepper"

type AssertStepperOrientation = StepperOrientation extends "horizontal" | "vertical" ? true : false
const _o: AssertStepperOrientation = true; void _o

type AssertStepperStatus = StepperStatus extends "complete" | "current" | "upcoming" ? true : false
const _st: AssertStepperStatus = true; void _st

type AssertStepperStep = { label: React.ReactNode; description?: React.ReactNode }
type _CheckStep = AssertStepperStep extends StepperStep ? (StepperStep extends AssertStepperStep ? true : never) : never
const _step: _CheckStep = true; void _step

type AssertStepperShape = {
  steps: StepperStep[]
  current: number
  orientation?: StepperOrientation
  className?: string
  "aria-label"?: string
}
type _CheckStepperProps = AssertStepperShape extends Pick<StepperProps, keyof AssertStepperShape & keyof StepperProps> ? true : never
const _p: _CheckStepperProps = true; void _p

/** Status is derived from `current`, never passed in; children come from `steps`. */
type AssertNoStatus = "status" extends keyof StepperProps ? never : true
const _ns: AssertNoStatus = true; void _ns
type AssertNoChildren = "children" extends keyof StepperProps ? never : true
const _nc: AssertNoChildren = true; void _nc

/** The viewport is chosen by CSS, never by a prop (DEC-074). */
type AssertNoSize = "size" extends keyof StepperProps ? never : true
const _nz: AssertNoSize = true; void _nz
type AssertNoViewport = "viewport" extends keyof StepperProps ? never : true
const _nv: AssertNoViewport = true; void _nv
