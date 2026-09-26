/**
 * Atlas Slider — API contract v1
 */

import type { SliderProps, SliderOrientation } from "@atlas/ui-web/primitives/Slider/Slider"

type AssertSliderOrientation = SliderOrientation extends "horizontal" | "vertical" ? true : false
const _o: AssertSliderOrientation = true; void _o

type AssertSliderPropsShape = {
  range?: boolean
  value?: number | [number, number]
  defaultValue?: number | [number, number]
  onValueChange?: (value: number | [number, number]) => void
  min?: number
  max?: number
  step?: number
  orientation?: SliderOrientation
  disabled?: boolean
  name?: string
  label?: React.ReactNode
  valueLabel?: React.ReactNode
  helperText?: React.ReactNode
  leading?: React.ReactNode
  trailing?: React.ReactNode
  getAriaValueText?: (value: number) => string
}

type _CheckSliderProps = AssertSliderPropsShape extends Pick<SliderProps, keyof AssertSliderPropsShape & keyof SliderProps>
  ? true : never
const _p: _CheckSliderProps = true; void _p
