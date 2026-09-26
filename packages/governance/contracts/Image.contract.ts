/**
 * Atlas Image — API contract v1
 */

import type {
  ImageProps,
  ImageRatio,
  ImageFit,
  ImageRadius,
} from "@atlas/ui-web/primitives/Image/Image"

type AssertImageRatio = ImageRatio extends "1:1" | "4:3" | "3:2" | "16:9" | "16:10" | "9:16" | "3:4" | "2:3" | "4:5" | "auto" ? true : false
const _r: AssertImageRatio = true; void _r

type AssertImageFit = ImageFit extends "cover" | "contain" ? true : false
const _f: AssertImageFit = true; void _f

type AssertImageRadius = ImageRadius extends "none" | "sm" | "md" | "lg" | "xl" | "full" ? true : false
const _d: AssertImageRadius = true; void _d

type AssertImagePropsShape = {
  src: string
  alt: string
  ratio?: ImageRatio
  fit?: ImageFit
  radius?: ImageRadius
}

type _CheckImageProps = AssertImagePropsShape extends Pick<ImageProps, keyof AssertImagePropsShape & keyof ImageProps>
  ? true : never
const _p: _CheckImageProps = true; void _p
