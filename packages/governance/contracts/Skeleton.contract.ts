/**
 * Atlas Skeleton — API contract v1
 */

import type {
  SkeletonProps,
  SkeletonShape,
} from "@atlas/ui-web/primitives/Skeleton/Skeleton"

type AssertSkeletonShape = SkeletonShape extends "rect" | "circle" ? true : false
const _s: AssertSkeletonShape = true; void _s

type AssertSkeletonPropsShape = {
  shape?: SkeletonShape
}

type _CheckSkeletonProps = AssertSkeletonPropsShape extends Pick<SkeletonProps, keyof AssertSkeletonPropsShape & keyof SkeletonProps>
  ? true : never
const _p: _CheckSkeletonProps = true; void _p
